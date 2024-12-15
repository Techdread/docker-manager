import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import {
  AppBar,
  Box,
  Container,
  Paper,
  Toolbar,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import { getApiUrl } from './config';

function App() {
  const queryClient = useQueryClient();

  // Fetch containers
  const { data: containersResponse, isLoading, error } = useQuery('containers', async () => {
    const response = await axios.get(`${getApiUrl()}/containers`);
    return response.data;
  }, {
    refetchInterval: 5000,
  });

  const containers = containersResponse?.data || [];

  // Start container mutation
  const startContainer = useMutation(
    async (id) => {
      await axios.post(`${getApiUrl()}/containers/${id}/start`);
    },
    {
      onSuccess: () => queryClient.invalidateQueries('containers'),
    }
  );

  // Stop container mutation
  const stopContainer = useMutation(
    async (id) => {
      await axios.post(`${getApiUrl()}/containers/${id}/stop`);
    },
    {
      onSuccess: () => queryClient.invalidateQueries('containers'),
    }
  );

  if (error) {
    return (
      <Container>
        <Alert severity="error">Error loading containers: {error.message}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Docker Manager
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Containers
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : containers.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No containers found. Try pulling or creating a container first.
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {containers.map((container) => (
              <Card key={container.Id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {container.Names[0].replace('/', '')}
                  </Typography>
                  <Typography color="text.secondary">
                    Status: {container.State}
                  </Typography>
                  <Typography color="text.secondary">
                    Image: {container.Image}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<PlayArrowIcon />}
                    variant="contained"
                    color="success"
                    onClick={() => startContainer.mutate(container.Id)}
                    disabled={container.State === 'running'}
                  >
                    Start
                  </Button>
                  <Button
                    startIcon={<StopIcon />}
                    variant="contained"
                    color="error"
                    onClick={() => stopContainer.mutate(container.Id)}
                    disabled={container.State !== 'running'}
                  >
                    Stop
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default App;
