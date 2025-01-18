const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// MongoDB Schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['Super Admin', 'Admin', 'Manager'] },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// Main Function
const createSuperAdmin = async () => {
    const MONGO_URI = process.env.MONGO_URI; // Ensure .env has MONGO_URI
    const username = 'magicly';
    const plainPassword = '02X61ADefu3Tc2y'; // Set your desired password here

    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Check if Super Admin already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('Super Admin already exists');
            return;
        }

        // Create a new Super Admin
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const admin = new User({ username, role: 'Super Admin', password: hashedPassword });

        await admin.save();
        console.log(`Super Admin created successfully with username: ${username} and password: ${plainPassword}`);
    } catch (err) {
        console.error('Error creating Super Admin:', err);
    } finally {
        mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the Function
createSuperAdmin();
