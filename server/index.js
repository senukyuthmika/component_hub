const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ComponentHub API is running' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🔌 ComponentHub API running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints at http://localhost:${PORT}/api\n`);
});
