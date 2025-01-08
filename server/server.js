// server/server.js
const express = require('express');
const app = express();
const cors = require('cors');

const puzzleRoutes = require('./routes/puzzleRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/puzzles', puzzleRoutes);

// Server listen
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
