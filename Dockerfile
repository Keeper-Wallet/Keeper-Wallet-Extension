FROM node:10 as builder
WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .
RUN echo '{}' > config.json

RUN npm run dist

FROM selenium/standalone-chrome as selenium
COPY --from=builder /app/dist/chrome /app
COPY --from=builder /app/tests/fixtures /fixtures
EXPOSE 4444
