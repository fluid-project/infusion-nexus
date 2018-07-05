FROM node:8-alpine

# Switch to regular user
USER node

# Install npm dependencies
COPY --chown=node package.json /app/package.json
WORKDIR /app
RUN npm install

# Copy source
COPY --chown=node . /app

# Run tests
RUN npm test

# Expose port defined in the Nexus config
EXPOSE 9081

# Start the Nexus
CMD ["npm","start"]
