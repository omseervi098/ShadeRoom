FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

RUN pip freeze

RUN mkdir -p /app/models

ADD https://huggingface.co/omprakash96/sam-encoders/resolve/main/sam_vit_b_encoder.onnx /app/models/sam_vit_b_encoder.onnx

COPY . .

ENV ENCODER_PATH=/app/models/sam_vit_b_encoder.onnx

EXPOSE 7860

CMD gunicorn app:app --bind 0.0.0.0:7860 -w 4