const BASE_PORT = 3000;
const MAX_PORT_ATTEMPTS = 10;

async function findServerPort() {
  for (let port = BASE_PORT; port < BASE_PORT + MAX_PORT_ATTEMPTS; port++) {
    try {
      const response = await fetch(`http://localhost:${port}/server-info`);
      if (response.ok) {
        const data = await response.json();
        return data.port;
      }
    } catch (error) {
      continue;
    }
  }
  return BASE_PORT; // fallback to default port
}

let apiPort = BASE_PORT;

// Initialize port detection
findServerPort().then(port => {
  apiPort = port;
  console.log(`Connected to backend on port ${port}`);
}).catch(error => {
  console.error('Failed to detect backend port:', error);
});

export const API_URL = import.meta.env.VITE_API_URL || getApiUrl();
export const getApiUrl = () => `http://localhost:${apiPort}/api`;
