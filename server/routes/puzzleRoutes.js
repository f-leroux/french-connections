// server/routes/puzzleRoutes.js
const express = require('express');
const router = express.Router();
const puzzleController = require('../controllers/puzzleController');

// GET /api/puzzles/today
router.get('/today', (req, res) => {
  const puzzle = puzzleController.getPuzzleForToday();
  res.json(puzzle);
});

module.exports = router;
