# Deployment Guide

This document explains how to deploy this app to a free tier EC2 instance on AWS.

## 1. Creating a New EC2 Instance (Free Tier)

1. **Log in to AWS Console**
    - Go to [https://aws.amazon.com/](https://aws.amazon.com/) and sign in to your AWS account.

2. **Navigate to EC2 Dashboard**
    - In the AWS Management Console, search for "EC2" and open the EC2 service.

3. **Launch Instance**
    - Click the "Launch Instance" button.
    - Enter a name for your instance (e.g., `nasa-project-server`).

4. **Select Amazon Machine Image (AMI)**
    - Choose the latest "Amazon Linux 2 AMI (HVM), SSD Volume Type" (eligible for free tier).

5. **Choose Instance Type**
    - Select `t2.micro` (free tier eligible).

6. **Configure Key Pair**
    - Create a new key pair or use an existing one. Download and save the `.pem` file securely (you'll need it to SSH
      into the server).

7. **Configure Network Settings**
    - Allow SSH (port 22) from your IP.
    - Allow custom TCP (port 8000) for HTTP/HTTPS web traffic.

8. **Launch**
    - Click "Launch Instance". Wait for the instance to enter the "running" state.

9. **Connect to Your Instance**
    - Select your instance in the EC2 dashboard.
    - Click "Connect" and follow the instructions to SSH using your key pair.

## 2. Building and Pushing the Production Docker Image

### 1. **Build the Production Docker Image**

From the root directory, run the following npm script to build the production image using `docker-compose.prod.yml`:

```sh
npm run build:prod
```

### 2. **Authenticate with Docker Hub**

Log in to Docker Hub on your EC2 instance (or your local machine if pushing from there):

```sh
docker login
```

Enter your Docker Hub username and password when prompted.

### 3. **Push the Image to Docker Hub**

You can use the npm script for convenience:

```sh
npm run docker:push
```

Or run the command manually:

```sh
# docker push <your-dockerhub-username>/<repo-name>:latest
docker push wigansmartin/nasa-project
```

Make sure your `docker-compose.prod.yml` is configured to use the correct image name and tag.

## 3. Deploying on the EC2 Instance

### 1. SSH into Your EC2 Instance

Use the following command (update the path, user, and hostname as needed):

```sh
ssh -i "$HOME/dev/aws/ssh/nasa-project-aws-ec2-key-pair.pem" ec2-user@ec2-3-75-190-111.eu-central-1.compute.amazonaws.com
```

### 2. Initial Setup (First-Time Only)

Create a deployment folder:

  ```sh
  mkdir -p ~/nasa-deploy
  cd ~/nasa-deploy
  ```

Create a `.env.production` file inside `nasa-deploy` and add your secrets.
**Set secure permissions for your secrets:**

  ```sh
  chmod 600 ~/nasa-deploy/.env.production
  chmod 700 ~/nasa-deploy
  ```

These commands ensure that only your user can access the secrets file and folder.
(Optional) Verify ownership:

  ```sh
  ls -l ~/nasa-deploy/.env.production
  ls -ld ~/nasa-deploy
  ```

If needed, fix with:

  ```sh
  chown ec2-user:ec2-user ~/nasa-deploy/.env.production
  chown ec2-user:ec2-user ~/nasa-deploy
  ```

**Example .env.production file:**

```env
# The port your server will listen on
PORT=8000
# MongoDB connection string
MONGO_URI=mongodb+srv://...
```

Create the following `deploy.sh` script in `nasa-deploy`:

```bash
#!/bin/bash

# --- CONFIGURATION ---
IMAGE_NAME="wigansmartin/nasa-project"
CONTAINER_NAME="nasa-app"
ENV_FILE="/home/ec2-user/nasa-deploy/.env.production"
PORT=8000

# --- Pull the latest image from Docker Hub ---
echo "Pulling latest image: $IMAGE_NAME"
docker pull $IMAGE_NAME

# --- Stop and remove existing container if it exists ---
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
  echo "Stopping existing container..."
  docker stop $CONTAINER_NAME
  echo "Removing existing container..."
  docker rm $CONTAINER_NAME
fi

# --- Run the new container ---
echo "Running new container..."
docker run -d \
  --restart=always \
  --env-file "$ENV_FILE" \
  -p $PORT:$PORT \
  --name $CONTAINER_NAME \
  $IMAGE_NAME

echo "✅ Deployment complete. App running on port $PORT."
```

Make the script executable:

  ```sh
  chmod +x deploy.sh
  ```

### 3. Deploy New Versions

Every time you push a new image to Docker Hub, SSH into the instance, go to `nasa-deploy`, and run:

```sh
./deploy.sh
```

This will pull the latest image, stop/remove the old container, and run the new one with your environment config.
