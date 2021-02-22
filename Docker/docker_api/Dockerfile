FROM node:15
WORKDIR /usr/src/app 

COPY API/package.json ./
COPY API/package-lock.json ./
RUN npm install -production

COPY API/. .
ENV NODE_ENV=production

EXPOSE 5000

CMD ["node", "index.js"]


