require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const storage = require('./utils/storage');

// Import routes
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');

// Check if auth routes are properly loaded
console.log('Auth routes loaded:', Object.keys(authRoutes));

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/notes', noteRoutes);
app.use('/api/auth', authRoutes);

// Serve the main HTML file for all routes not handled by the API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Function to start the server
const startServer = () => {
  // Define PORT
  const PORT = process.env.PORT || 5001;
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Using ${storage.isUsingInMemory ? 'in-memory storage' : 'MongoDB'} for data persistence`);
    console.log(`Open http://localhost:${PORT} in your browser to view the app`);
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
  .then(() => {
    console.log('MongoDB Connected...');
    storage.setInMemoryMode(false);
    startServer();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    console.log('Falling back to in-memory storage...');
    storage.setInMemoryMode(true);
    startServer();
  });
