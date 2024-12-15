# Docker Manager

A full-stack web application for managing Docker containers with a React frontend and Node.js backend.

## Features

- Start and stop Docker containers
- View container status
- Monitor container logs in real-time
- Clean and intuitive user interface

## Prerequisites

- Node.js (v16 or higher)
- Docker with WSL 2
- Docker Compose

## Project Structure

```
docker-manager/
├── frontend/         # React frontend application
├── backend/          # Node.js backend application
├── docker-compose.yml
└── README.md
```

## Setup Instructions

1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Start the development servers:
   ```bash
   npm run dev
   ```

3. Access the application:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Docker Deployment

To run the application using Docker Compose:

```bash
docker-compose up --build
```
