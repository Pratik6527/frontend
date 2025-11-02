// This file is api/messages.js

import mongoose from 'mongoose';
import 'dotenv/config'; // Make sure environment variables are read

// 1. --- Connect to MongoDB (reusing connection) ---
try {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in .env or Vercel');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for admin');
} catch (error) {
  console.error('MongoDB connection error:', error.message);
}

// 2. --- Get the Message Model ---
// This reuses the model from api/contact.js
const Message = mongoose.models.Message || mongoose.model('Message', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

// 3. --- The Vercel Serverless Function ---
export default async function handler(req, res) {

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body;
    
    // 4. --- SECURITY CHECK ---
    // Compare the password from the form to your secret environment variable
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized: Wrong password' });
    }
    
    // 5. --- FETCH MESSAGES ---
    // If password was correct, fetch messages from MongoDB, newest first
    const messages = await Message.find({}).sort({ createdAt: -1 });
    
    res.status(200).json(messages);

  } catch (error) {
    console.error('Admin Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
}