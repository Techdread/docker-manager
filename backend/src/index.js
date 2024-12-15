import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import Docker from 'dockerode';
import winston from 'winston';

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();
const port = process.env.PORT || 3000;

// Initialize Docker client
const docker = new Docker({
  socketPath: '//./pipe/docker_engine'
});

// Test Docker connection
docker.ping().then(() => {
  logger.info('Successfully connected to Docker daemon');
}).catch((error) => {
  logger.error('Failed to connect to Docker daemon:', {
    error: error.message,
    code: error.code,
    details: error.toString()
  });
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    logger.info('Containers fetched:', { count: containers.length });
    res.json({ data: containers });
  } catch (error) {
    logger.error('Error fetching containers:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
});

app.post('/api/containers/:id/start', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error starting container ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to start container' });
  }
});

app.post('/api/containers/:id/stop', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error stopping container ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to stop container' });
  }
});

app.get('/api/containers/:id/logs', async (req, res) => {
  try {
    const container = docker.getContainer(req.params.id);
    const logs = await container.logs({
      stdout: true,
      stderr: true,
      tail: 100,
      follow: false
    });
    res.send(logs);
  } catch (error) {
    logger.error(`Error fetching logs for container ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch container logs' });
  }
});

let currentPort = port;

// Add server info endpoint
app.get('/server-info', (req, res) => {
  res.json({
    port: currentPort,
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const startServer = (retryPort = port) => {
  const server = app.listen(retryPort, () => {
    currentPort = retryPort;
    logger.info(`Server running on port ${retryPort}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${retryPort} is busy, trying ${retryPort + 1}`);
      startServer(retryPort + 1);
    } else {
      logger.error('Server error:', err);
    }
  });
};

startServer();
