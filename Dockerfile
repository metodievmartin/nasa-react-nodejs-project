FROM node:22-alpine

# Set working directory in the container
WORKDIR /app

# Copy root package.json for dependency context
COPY package.json .

# Copy and install client dependencies (production only)
COPY client/package.json client/
RUN npm run install:client --omit=dev

# Copy and install server dependencies (production only)
COPY server/package.json server/
RUN npm run install:server --omit=dev

# Copy client source and build React app
COPY client/ client/
# Accept API_URL as a build argument for React
ARG API_URL
# Set environment variable for React build
ENV REACT_APP_API_URL=$API_URL
RUN npm run build:client

# Copy server source code
COPY server/ server/

# Use non-root user for security
USER node

# Start the server
CMD [ "npm", "start" ]

# Expose backend port
EXPOSE 8000