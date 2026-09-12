FROM node:20-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY index.js .
COPY admin.html .
EXPOSE 3000
CMD ["node", "index.js"]
