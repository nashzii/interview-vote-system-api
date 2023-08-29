FROM node:18-alpine as builder
ENV NODE_ENV build
WORKDIR /home/node
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine
USER node
WORKDIR /home/node
COPY --from=builder /home/node/package*.json ./
COPY --from=builder /home/node/node_modules/ ./node_modules/
COPY --from=builder /home/node/dist/ ./dist/
COPY .env.production .
CMD ["node", "dist/main.js"]