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
WORKDIR /app
COPY package.json yarn.lock ./
# install dependencies
RUN yarn install --frozen-lockfile
COPY . .
# build
RUN yarn build
# remove dev dependencies
RUN npm prune --production
FROM node:alpine
WORKDIR /app
# copy from build image
COPY --from=BUILD_IMAGE /app/package.json ./package.json
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY --from=BUILD_IMAGE /app/.next ./.next
COPY --from=BUILD_IMAGE /app/public ./public
EXPOSE 3000
CMD ["yarn", "start"]