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
});
const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: String,
});
const TrialCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
});
const User = mongoose.model('User', UserSchema);
const Question = mongoose.model('Question', QuestionSchema);
const TrialCode = mongoose.model('TrialCode', TrialCodeSchema);

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

// Add Users (Super Admin Only)
app.post('/add-user', isAuthenticated, isRole('Super Admin'), async (req, res) => {
    const { username, password, role } = req.body;
    try {
        if (!['Super Admin', 'Admin', 'Manager'].includes(role)) {
            return res.status(400).send('Invalid role');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, role, password: hashedPassword });
        await user.save();
        res.status(201).send('User added');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Add Questions (Admin Only)
app.post('/add-question', isAuthenticated, isRole('Admin'), async (req, res) => {
    const { question, options, correctAnswer } = req.body;
    try {
        const newQuestion = new Question({ question, options, correctAnswer });
        await newQuestion.save();
        res.status(201).send('Question added');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Start Exam
app.post('/start-exam', isAuthenticated, async (req, res) => {
    const { trialCode } = req.body;
    try {
        const code = await TrialCode.findOne({ code: trialCode, used: false });
        if (!code) return res.status(400).send('Invalid or used trial code');

        code.used = true;
        await code.save();

        const questions = await Question.aggregate([{ $sample: { size: 20 } }]);
        res.status(200).json({ questions });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Submit Exam
app.post('/submit-exam', isAuthenticated, async (req, res) => {
    const { answers } = req.body;
    try {
        const questions = await Question.find();
        const score = answers.reduce((total, answer) => {
            const question = questions.find(q => q._id.toString() === answer.questionId);
            return question && question.correctAnswer === answer.answer ? total + 1 : total;
        }, 0);

        // Discord Webhook
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (webhookUrl) {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `User ${req.session.user.username} scored ${score}/20` }),
            });
        }

        res.status(200).send(`You scored ${score}/20`);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
