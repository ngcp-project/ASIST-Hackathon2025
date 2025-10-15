# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=22.19.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV development


WORKDIR /usr/src/app
# Copy only package manifests first and install dependencies. This bakes
# node_modules into the image so the anonymous volume created by docker-compose
# for /usr/src/app/node_modules will be populated with the installed deps on
# first run. This avoids the "module not found" errors caused by mounting the
# project directory over the image filesystem before dependencies exist.
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Run the application as a non-root user.
USER node

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["npm", "run", "dev"]
