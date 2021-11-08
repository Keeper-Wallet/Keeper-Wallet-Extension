FROM node:10 as builder
WORKDIR /app
RUN echo '{}' > config.json

COPY package.json package-lock.json ./
RUN npm install

COPY src ./src
COPY scripts ./scripts
COPY .babelrc init_config.json tsconfig.json webpack.config.js ./
RUN npm run dist

FROM selenium/standalone-chrome as selenium
EXPOSE 4444
COPY --from=builder /app/dist/chrome /app
COPY --from=builder /app/tests/fixtures /fixtures
