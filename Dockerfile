FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY . .
RUN npm install
RUN npx prisma generate
RUN npx prisma db push

RUN npm run build
EXPOSE 3000
ENTRYPOINT ["npm", "run", "start"]
#CMD ["/bin/sh"]




