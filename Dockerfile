FROM node:6-alpine

EXPOSE 9081

WORKDIR /home/node/nexus
COPY . /home/node/nexus

RUN yarn && yarn cache clean

CMD ["sh","-c","node nexus.js"]
