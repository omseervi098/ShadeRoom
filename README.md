# ShadeRoom

## Project Description and Purpose
ShadeRoom is an advanced web application that allows users to edit and manipulate room images using AI-powered segmentation. The application enables users to select specific areas of a room image and apply different colors or textures to them, making it easy to visualize interior design changes without physically altering the space.

The primary purpose of ShadeRoom is to provide a user-friendly tool for interior designers, homeowners, and real estate professionals to experiment with different color schemes and textures in room images, helping them make informed decisions about interior design changes.

## Features
- **AI-Powered Image Segmentation**: Utilizes the Segment Anything Model (SAM) to intelligently identify and select areas in room images
- **Multiple Selection Tools**:
  - Lasso tool for freeform selection
  - Polygon/Pen tool for precise manual selection
  - Hover mode for quick previews
- **Color and Texture Application**: Apply various colors and textures to selected areas
- **Responsive Design**: Works on both desktop and mobile devices
- **Real-time Preview**: See changes instantly as you edit
- **Multi-step Workflow**: Guided journey through the editing process
- **Image Processing**: Handles image compression and manipulation

## Architecture Overview
ShadeRoom is built using a modern React architecture with the following key components:

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Build tool for fast development and optimized production builds
- **React Router**: For navigation between pages
- **React Konva**: Canvas manipulation for image editing
- **Tailwind CSS**: For styling and responsive design

### State Management
- **Context API**: Multiple context providers for different aspects of the application:
  - EditorProvider: Manages the image editing state
  - StepperProvider: Manages the multi-step workflow
  - GeneralProvider: Manages general application state

### ML Integration
- **ONNX Runtime**: For running the ML models in the browser
- **Segment Anything Model (SAM)**: For image segmentation
- **Backend API**: For generating image embeddings

### Data Flow
1. User uploads an image
2. Image is sent to backend for embedding generation
3. Frontend loads the SAM model for segmentation
4. User selects areas using various tools
5. Selected areas are processed by the ML model
6. User applies colors or textures to the selected areas
7. Changes are rendered in real-time on the canvas

## Deployment Instructions
### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Local Development
1. Clone the repository:
   ```
   git clone https://github.com/omseervi098/ShadeRoom.git
   ```

2. Switch to the correct branch:
   ```
   git checkout react-vite-new-frontend
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SHADEROOM_BACKEND_URI=<backend_api_url>
   VITE_SHADEROOM_BACKEND_TOKEN=<api_token>
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5173`

### Production Deployment
1. Build the application:
   ```
   npm run build
   ```

2. The built files will be in the `dist` directory, which can be deployed to any static hosting service like Netlify, Vercel, or GitHub Pages.

3. For Netlify deployment, the repository includes a `netlify.toml` configuration file.

## Hosted Status
[![Netlify Status](https://api.netlify.com/api/v1/badges/7d3ddca0-e193-407d-afbe-d276e76fa075/deploy-status)](https://app.netlify.com/sites/shaderoom/deploys)

## Contributing Guidelines
We welcome contributions to ShadeRoom! Here's how you can contribute:

### Code Style
- Follow the existing code style and structure
- Use meaningful variable and function names
- Add JSDoc comments to all components and functions
- Use proper indentation and formatting

### Pull Request Process
1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Submit a pull request with a clear description of the changes

### Reporting Issues
- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Include screenshots if applicable
- Specify the browser and operating system you're using

### Feature Requests
- Use the GitHub issue tracker to request new features
- Clearly describe the feature and its use case
- Provide mockups or examples if possible

## License
[MIT License](LICENSE)

## Acknowledgements
- [Segment Anything Model (SAM)](https://segment-anything.com/) for the image segmentation technology
- [ONNX Runtime](https://onnxruntime.ai/) for the ML model inference
- [React Konva](https://konvajs.org/docs/react/index.html) for canvas manipulation
