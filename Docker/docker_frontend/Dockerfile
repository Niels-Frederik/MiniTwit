FROM node:15 as builder
ENV NODE_ENV=production
WORKDIR /app 

COPY Frontend/package.json ./
COPY Frontend/package-lock.json ./
RUN npm install -production

COPY Frontend/. .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

