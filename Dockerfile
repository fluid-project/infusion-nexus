FROM node:12.18.3-alpine

# Switch to regular user
USER node

# Install npm dependencies
COPY --chown=node package.json /app/package.json
WORKDIR /app
RUN npm install

# Copy source
COPY --chown=node . /app

# Expose port defined in the Nexus config
EXPOSE 9081

# Start the Nexus
CMD ["npm","run", "serve"]
