FROM node:10 as builder
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

# COPY . .
# RUN echo '{}' > config.json

# RUN npm run dist

FROM selenium/standalone-chrome-debug as selenium
EXPOSE 4444
