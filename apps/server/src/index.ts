import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Basic API routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO Setup
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Basic Tournament Room Logic
  socket.on('join_tournament', (tournamentId: string) => {
    socket.join(`tournament_${tournamentId}`);
    console.log(`[Socket] ${socket.id} joined tournament ${tournamentId}`);
    
    // Broadcast to others in the room
    socket.to(`tournament_${tournamentId}`).emit('player_joined', {
      playerId: socket.id,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`[Server] House of Fortune Backend listening on port ${port}`);
});
