const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serves static files from public folder

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log('MongoDB connection error:', err));

// Define the User and Booking schemas
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const bookingSchema = new mongoose.Schema({
    from: String,
    to: String,
    date: String,
    seats: Number,
    email: String
});

const User = mongoose.model('User', userSchema);
const Booking = mongoose.model('Booking', bookingSchema);

// Routes

// Sign-up route
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists. Please sign in.' });
        }

        // Create and save new user
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(201).json({ message: 'Sign-up successful!' });
    } catch (error) {
        console.error('Sign-up Error:', error);
        res.status(500).json({ message: 'Sign-up failed. Please try again.' });
    }
});

// Sign-in route
app.post('/api/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exist. Please sign up first.' });
        }

        // Check if the password matches
        if (user.password !== password) {
            return res.status(400).json({ message: 'Invalid credentials. Please try again.' });
        }

        // On success, send a success message and status 200
        res.status(200).json({ message: 'Sign-in successful!' });
    } catch (error) {
        console.error('Sign-in Error:', error);
        res.status(500).json({ message: 'Sign-in failed. Please try again.' });
    }
});

// Book tickets route
app.post('/api/book', async (req, res) => {
    const { from, to, date, seats, email } = req.body;

    try {
        // Create a new booking document and save it to the database
        const newBooking = new Booking({ from, to, date, seats, email });
        await newBooking.save();
        res.status(201).json({ message: 'Booking successful!' });
    } catch (error) {
        console.error('Booking Error:', error);
        res.status(500).json({ message: 'Booking failed. Please try again.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
