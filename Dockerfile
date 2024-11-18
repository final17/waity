# Step 1: Use Nginx to serve the prebuilt React application
FROM nginx:alpine

# Set the working directory for Nginx
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy the prebuilt React application from the local `./build` directory
COPY ./build .

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 instead of 3000
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
