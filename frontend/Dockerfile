# FROM node:16-alpine

# RUN mkdir -p /frontend
# WORKDIR /frontend

# # copy all content from current working dir to the workdir
# COPY . .

# RUN npm install
# RUN npm run build

# EXPOSE 3000
# CMD ["npm", "start"]

FROM node:16-alpine as BUILD_IMAGE
WORKDIR /frontend
COPY package.json package-lock.json ./
# install dependencies
RUN npm ci
COPY . .
# build
RUN npm run build 
# remove dev dependencies
RUN npm prune --production

FROM node:alpine
WORKDIR /frontend
# copy from build image
COPY --from=BUILD_IMAGE /frontend/package.json ./package.json
COPY --from=BUILD_IMAGE /frontend/node_modules ./node_modules
COPY --from=BUILD_IMAGE /frontend/.next ./.next
COPY --from=BUILD_IMAGE /frontend/public ./public
EXPOSE 3000
CMD ["npm", "start"]