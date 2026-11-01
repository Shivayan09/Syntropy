# One image for the gateway and all 5 services.
# Each container starts a different entry file (see "command" in docker-compose.yml).
FROM node:22-alpine

WORKDIR /app
RUN chown node:node /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY common ./common
COPY gateway ./gateway
COPY services ./services
# Tesseract's English data, used by the syllabus service to read text from images.
COPY eng.traineddata ./

# Syllabus uploads are written here while being parsed, then deleted.
RUN mkdir uploads && chown node:node uploads

USER node
