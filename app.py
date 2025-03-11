import logging
import os
import cv2
import numpy as np
import onnxruntime
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, expose_headers=["Content-Disposition"])

# Set up rate limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)


encoder_session = None
INPUT_SIZE = (684, 1024)  # Standardize input size for SAM encoder
MAX_CONTENT_LENGTH = 10 * 1024 * 1024
ENCODER_PATH = os.getenv("ENCODER_PATH", "models/sam_vit_b_encoder.onnx")

def get_encoder_session() -> onnxruntime.InferenceSession:
    global encoder_session

    if encoder_session is None:
        try:
            # Set intra_op_num_threads to control parallelism
            session_options = onnxruntime.SessionOptions()
            session_options.intra_op_num_threads = 2  # Limit threads

            encoder_session = onnxruntime.InferenceSession(
                ENCODER_PATH,
                providers=['CPUExecutionProvider'],
                sess_options=session_options
            )
            logger.info(f"Loaded ONNX model from : {ENCODER_PATH}")
        except Exception as e:
            logger.error(f"Failed to load ONNX model: {e}")
            raise

    return encoder_session
def preprocess_image(image: Image.Image) -> np.ndarray:
    try:
        # Resize image to a manageable size before further processing to reduce memory usage
        max_dim = 1500
        width, height = image.size
        if max(width, height) > max_dim:
            scale = max_dim / max(width, height)
            new_width = int(width * scale)
            new_height = int(height * scale)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            logger.info(f"Resized image from {width}x{height} to {new_width}x{new_height}")

        cv_image = np.array(image)
        if cv_image.ndim == 2:  # Convert grayscale to RGB
            cv_image = cv2.cvtColor(cv_image, cv2.COLOR_GRAY2RGB)
        elif cv_image.shape[2] == 4:  # Handle RGBA
            cv_image = cv2.cvtColor(cv_image, cv2.COLOR_RGBA2RGB)

        # Calculate scaling
        scale_x = INPUT_SIZE[1] / cv_image.shape[1]
        scale_y = INPUT_SIZE[0] / cv_image.shape[0]
        scale = min(scale_x, scale_y)

        # Affine transformation
        transform_matrix = np.array([[scale, 0, 0], [0, scale, 0], [0, 0, 1]])
        resized_image = cv2.warpAffine(
            cv_image,
            transform_matrix[:2],
            (INPUT_SIZE[1], INPUT_SIZE[0]),
            flags=cv2.INTER_LINEAR
        )
        return np.ascontiguousarray(resized_image.astype(np.float32))
    except Exception as e:
        logger.error(f"Image preprocessing failed: {e}")
        raise


@app.route('/', methods=['GET', 'POST'])
def home():
    return jsonify({"message": "Welcome to ShadeRoom API"}), 200

@app.route('/health', methods=['GET', 'POST'])
def health_check():
    try:
        session = get_encoder_session()
        return jsonify({
            "status": "healthy",
            "model": "available",
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/get-embedding', methods=['POST'])
@limiter.limit("5 per minute")
def get_embedding():
    if 'image' not in request.files:
        logger.warning("No image provided in request")
        return jsonify({"error": "No image provided"}), 400

    image_file = request.files['image']
    if not image_file.filename:
        return jsonify({"error": "Empty file provided"}), 400

    allowed_extensions = {'jpg', 'jpeg', 'png', 'webp'}
    if '.' not in image_file.filename or \
            image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Invalid file format"}), 400

    image_file.seek(0, os.SEEK_END)
    file_size = image_file.tell()
    image_file.seek(0)
    if file_size > MAX_CONTENT_LENGTH:
        return jsonify({
            "error": f"File too large. Maximum size is {MAX_CONTENT_LENGTH // (1024 * 1024)}MB"
        }), 413

    logger.info(f"Processing image: {image_file.filename}, size: {file_size/(1024*1024)}MB")

    try:
        session = get_encoder_session()
        # Open and preprocess image
        img = Image.open(image_file.stream)
        processed_image = preprocess_image(img)

        # Run inference
        encoder_inputs = {"input_image": processed_image}
        output = session.run(None, encoder_inputs)

        if output is None or len(output) == 0:
            logger.error("No output from encoder")
            return jsonify({"error": "Embedding generation failed"}), 500

        image_embedding = output[0].astype(np.float32).tolist()
        logger.info("Embedding generated successfully")
        return jsonify({"embedding": image_embedding})

    except Exception as e:
        logger.error(f"Embedding generation failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "Rate limit exceeded. Please try again later.",
        "retry_after": e.description
    }), 429

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))  # Default to 7860 for Hugging Face Spaces
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1", "t")
    logger.info(f"Starting Flask app on {host}:{port} with debug={debug}")
    app.run(host=host, port=port, debug=debug)