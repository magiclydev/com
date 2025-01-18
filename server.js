const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(express.static('public')); // Serve static files

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Schemas
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['Super Admin', 'Admin', 'Manager'] },
    password: { type: String, required: true },
    isEnabled: { type: Boolean, default: true },
});
const TestResultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    testDate: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    isArchived: { type: Boolean, default: false },
});
const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
});

const User = mongoose.model('User', UserSchema);
const TestResult = mongoose.model('TestResult', TestResultSchema);
const Question = mongoose.model('Question', QuestionSchema);

// Middleware for Authentication and Role Check
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.status(401).send('Unauthorized');
}

function isRole(role) {
    return (req, res, next) => {
        if (req.session.user && req.session.user.role === role) return next();
        res.status(403).send('Forbidden');
    };
}

// Routes

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.user = user;
            res.status(200).send('Logged in');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Get All Users (Super Admin Only)
app.get('/admin/users', isAuthenticated, isRole('Super Admin'), async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send('Error fetching users');
    }
});

// Enable/Disable User
app.patch('/admin/users/:id', isAuthenticated, isRole('Super Admin'), async (req, res) => {
    const { id } = req.params;
    const { isEnabled } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { isEnabled }, { new: true });
        if (!user) return res.status(404).send('User not found');
        res.status(200).send(`User ${user.username} is now ${isEnabled ? 'enabled' : 'disabled'}`);
    } catch (err) {
        res.status(500).send('Error updating user');
    }
});

// Get Test Results
app.get('/admin/results', isAuthenticated, isRole('Admin'), async (req, res) => {
    try {
        const results = await TestResult.find()
            .populate('userId', 'username')
            .sort({ testDate: -1 });
        res.status(200).json(results);
    } catch (err) {
        res.status(500).send('Error fetching test results');
    }
});

// Archive/Restore Test Results
app.patch('/admin/results/:id', isAuthenticated, isRole('Admin'), async (req, res) => {
    const { id } = req.params;
    const { isArchived } = req.body;
    try {
        const result = await TestResult.findByIdAndUpdate(id, { isArchived }, { new: true });
        if (!result) return res.status(404).send('Result not found');
        res.status(200).send(`Test result is now ${isArchived ? 'archived' : 'restored'}`);
    } catch (err) {
        res.status(500).send('Error updating test result');
    }
});

// Add Notes to Test Results
app.patch('/admin/results/:id/notes', isAuthenticated, isRole('Admin'), async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    try {
        const result = await TestResult.findByIdAndUpdate(id, { notes }, { new: true });
        if (!result) return res.status(404).send('Result not found');
        res.status(200).send('Notes updated successfully');
    } catch (err) {
        res.status(500).send('Error updating notes');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
