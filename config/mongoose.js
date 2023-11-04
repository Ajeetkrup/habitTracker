const mongoose = require('mongoose');
const dotenv = require('dotenv');

// get config vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;

// Error handling
db.on('error', console.error.bind(console, 'Error connecting to MongoDB'));

// Connection successful
db.once('open', function() {
    console.log('Connected to database: MongoDB');
});

module.exports = db;