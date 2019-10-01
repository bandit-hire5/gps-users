FROM node:carbon

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . ./

RUN cd ./
RUN ls -la