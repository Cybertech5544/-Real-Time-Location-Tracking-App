import { Server } from 'socket.io';

// Create a simple in-memory store for demo purposes
// Note: For production, you'd want to use a proper database or Redis
const userLocations = new Map();

export default function handler(req, res) {
  // Check if Socket.IO server is already running
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');
    
    // Initialize Socket.IO
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    
    // Handle connections
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      // Send existing locations to the new user
      userLocations.forEach((location, userId) => {
        if (userId !== socket.id) {
          socket.emit('receive-location', { id: userId, ...location });
        }
      });
      
      // Handle location updates
      socket.on('send-location', (data) => {
        // Store the user's location
        userLocations.set(socket.id, data);
        
        // Broadcast to all other users
        socket.broadcast.emit('receive-location', { 
          id: socket.id, 
          ...data 
        });
      });
      
      // Handle disconnections
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove user from storage
        userLocations.delete(socket.id);
        
        // Notify other users
        socket.broadcast.emit('user-disconnected', socket.id);
      });
    });
  } else {
    console.log('Socket.IO server already running');
  }
  
  // End the response
  res.end();
}