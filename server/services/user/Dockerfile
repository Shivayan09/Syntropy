# The user image. Built from this folder only, so it contains nothing from other services.
FROM node:22-alpine

WORKDIR /app
RUN chown node:node /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

USER node
CMD ["node", "index.js"]
