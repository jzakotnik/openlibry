FROM node:18-alpine
#FROM node:20-alpine3.20
#FROM node:20.18-alpine
WORKDIR /app
COPY package.json ./
COPY . .
RUN apk update && apk upgrade openssl
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3
RUN npm install
RUN npx prisma generate
RUN npx prisma db push

RUN npm run build
EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]
#CMD ["/bin/sh"]




