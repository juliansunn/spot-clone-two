FROM node:14-alpine

RUN mkdir -p /frontend

WORKDIR /frontend

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install

# copy all content from current working dir to the workdir
COPY . .

RUN npm run build

EXPOSE 3000

USER node

# Run npm start script with PM2 when container starts
CMD ["pm2", "start",  "npm", "--name", "spot-site", "--", "start"]
