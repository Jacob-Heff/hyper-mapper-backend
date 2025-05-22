require('dotenv').config(); // Load environment variables from .env file

console.log('--- Debugging .env ---');
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
console.log('--- End Debugging ---');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Import cors middleware

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// --- Middleware ---
// CORS configuration: Allows requests from your frontend.
// For development (testing locally with both frontend & backend):
// app.use(cors({ origin: '*' })); // Allows all origins, less secure for production.
// For production (after you know your GitHub Pages URL):
app.use(cors({
    origin: 'https://YOUR_GITHUB_USERNAME.github.io' // <<< IMPORTANT: Replace with your actual GitHub Pages URL
}));
app.use(express.json()); // Enable parsing of JSON request bodies

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema and Model ---
const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, default: '' },
    location: { type: String, default: '' },
    notes: { type: String, default: '' }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const Resource = mongoose.model('Resource', resourceSchema);

// --- API Routes ---

// POST /api/resources - Add a new resource
app.post('/api/resources', async (req, res) => {
    try {
        const newResource = new Resource(req.body); // req.body will contain the resource data
        await newResource.save();
        res.status(201).json(newResource); // 201 Created status
    } catch (error) {
        res.status(400).json({ message: error.message }); // 400 Bad Request if validation fails
    }
});

// GET /api/resources - Get all resources
app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.find(); // Find all documents
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message }); // 500 Internal Server Error
    }
});

// GET /api/resources/filter?category=<categoryName> - Filter resources by category
app.get('/api/resources/filter', async (req, res) => {
    try {
        const category = req.query.category; // Get category from query parameter
        if (!category) {
            return res.status(400).json({ message: "Category query parameter is required." });
        }
        // Use a regular expression for case-insensitive partial matching
        const resources = await Resource.find({ category: new RegExp(category, 'i') });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});