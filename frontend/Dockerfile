# Use Node.js as base image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
