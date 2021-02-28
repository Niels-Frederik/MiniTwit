FROM node:15 as builder
ENV NODE_ENV=production
WORKDIR /app 

COPY package.json ./
COPY package-lock.json ./
RUN npm install -production

COPY . .
RUN npm run build
ENV NODE_ENV=production

FROM nginx:stable-alpine
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
ENV NODE_ENV=production
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

