FROM node:8-alpine

EXPOSE 9081

WORKDIR /app
COPY . /app

RUN npm install && \
    chown -R node:node . && \
    npm cache clean --force

USER node

CMD ["npm","start"]
