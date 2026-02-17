# Use Node.js LTS version
FROM node:18-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source
COPY . .

# Create directory for uploads if it doesn't exist
RUN mkdir -p frontend/images/uploads data

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD [ "npm", "start" ]