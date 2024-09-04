// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for security
  },
});

app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  preferences: Array,
});

const User = mongoose.model('User', userSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(400).send('Invalid credentials');
  }
});

// Matching Algorithm (simple rule-based example)
app.post('/match', async (req, res) => {
  const { userId } = req.body; // Current user ID from the token
  const user = await User.findById(userId);

  // Simple rule-based match based on preferences
  const potentialMatches = await User.find({ preferences: { $in: user.preferences }, _id: { $ne: userId } });

  res.json(potentialMatches);
});

// Real-time Chat
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (data) => {
    io.emit('message', data); // Broadcast to all connected users
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
