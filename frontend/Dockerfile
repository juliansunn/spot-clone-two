FROM node:16-alpine

RUN mkdir -p /frontend
WORKDIR /frontend

# copy all content from current working dir to the workdir
COPY . .

RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]