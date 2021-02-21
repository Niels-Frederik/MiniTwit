FROM node:15
ENV NODE_ENV=production
WORKDIR /usr/src/app 

COPY API/package.json ./
COPY API/package-lock.json ./
RUN apt update && apt install -y apt-transport-https ca-certificates sqlite3
RUN npm install -production

COPY API/. .

EXPOSE 5000

CMD ["node", "index.js"]


