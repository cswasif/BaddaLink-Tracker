# Railway Deployment Guide for wt-tracker

## Overview
This wt-tracker has been configured for easy deployment on Railway with the following features:
- Docker-based deployment
- Railway-optimized configuration
- Health checks
- Automatic builds

## Files Added
- `Dockerfile` - Container configuration
- `railway.json` - Railway deployment configuration
- `railway-config.json` - Optimized tracker configuration for Railway

## Deployment Steps

### 1. Connect to Railway
1. Go to [Railway](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select the `cswasif/BaddaLink-Tracker` repository

### 2. Configure Environment Variables (Optional)
In Railway dashboard, you can set these environment variables:
- `PORT` - Railway will automatically set this (default: 8000)
- `NODE_ENV` - Set to `production`

### 3. Deploy
Railway will automatically:
- Build the Docker image
- Run the tracker on port 8000
- Set up health checks
- Provide a public URL

## Configuration Details

### Railway Config (`railway.json`)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Tracker Config (`railway-config.json`)
- Runs on port 8000 (Railway's default)
- Allows all origins for WebSocket connections
- Optimized for Railway's environment
- No SSL configuration needed (Railway handles HTTPS)

### Dockerfile
- Based on Node.js 18 Alpine
- Installs production dependencies only
- Builds the TypeScript project
- Includes health check endpoint
- Uses the railway-config.json file

## Health Check
The tracker includes a health check endpoint at `/stats.json` that Railway will use to monitor the service.

## WebSocket Support
The tracker supports both:
- `ws://` (WebSocket)
- `wss://` (WebSocket Secure) 

Railway automatically provides HTTPS, so wss:// connections will work via the public URL.

## Usage
Once deployed, your tracker will be available at:
- `ws://your-app.railway.app:8000` (WebSocket)
- `wss://your-app.railway.app` (WebSocket Secure)

## Monitoring
Check the `/stats.json` endpoint to monitor tracker statistics and health.