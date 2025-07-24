require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// In-memory notes storage as fallback when MongoDB is not available
let inMemoryNotes = [];
let isUsingInMemory = false;

// Helper function to generate unique IDs for in-memory notes
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Export in-memory storage and helper function for controllers
module.exports = { inMemoryNotes, isUsingInMemory, generateId };

// Import routes
const noteRoutes = require('./routes/noteRoutes');
const authRoutes = require('./routes/authRoutes');

// Check if auth routes are properly loaded
console.log('Auth routes loaded:', Object.keys(authRoutes));

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

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
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Using ${isUsingInMemory ? 'in-memory storage' : 'MongoDB'} for data persistence`);
    console.log(`Open http://localhost:${PORT} in your browser to view the app`);
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('MongoDB Connected...');
    isUsingInMemory = false;
    startServer();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    console.log('Falling back to in-memory storage...');
    isUsingInMemory = true;
    startServer();
  });