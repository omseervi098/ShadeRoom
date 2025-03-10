FROM python:3.10-alpine

WORKDIR /app

RUN apk update && \
    apk add --no-cache curl

ENV MODEL_NAME=sam_vit_b_encoder.onnx
ENV MODEL_DIR=/app/models
ENV BASE_URL=https://huggingface.co/omprakash96/sam-encoders/resolve/main/$MODEL_NAME
ENV ENCODER_PATH="${MODEL_DIR}/${MODEL_NAME}"

RUN mkdir -p $MODEL_DIR

RUN curl -L -o $MODEL_DIR -H "Authorization: Bearer ${HF_AUTH_TOKEN}" $BASE_URL

COPY requirements.txt .
RUN echo "${HF_AUTH_TOKEN}"
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860

CMD gunicorn app:app --bind 0.0.0.0:7860 -w 4