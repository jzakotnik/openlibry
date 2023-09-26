FROM node:lts-buster
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx prisma db push

RUN npm run build
EXPOSE 3010
ENTRYPOINT ["npm", "run", "start"]

