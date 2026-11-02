# The syllabus image. Built from this folder only, so it contains nothing from other services.
FROM node:22-alpine

WORKDIR /app
RUN chown node:node /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
# Syllabus uploads are written here while being parsed, then deleted.
RUN mkdir -p uploads && chown node:node uploads

USER node
CMD ["node", "index.js"]
