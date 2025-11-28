// backend/src/app.js

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import storeRoutes from './routes/storeRoutes.js';

// Create the Express app
const app = express();

// Middleware
app.use(cors());          // allow frontend (mobile) to call this API
app.use(express.json());  // parse JSON bodies

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'storesight-backend' });
});

// Store-related routes
app.use('/stores', storeRoutes);

// Start the server
app.listen(config.port, () => {
  console.log(`StoreSight backend running on port ${config.port}`);
});