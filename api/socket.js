import { Server } from 'socket.io';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');
    
    const io = new Server(res.socket.server);
    res.socket.server.io = io;
    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);
      
      socket.on('send-location', (data) => {
        io.emit('receive-location', { id: socket.id, ...data });
      });
      
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        io.emit('user-disconnected', socket.id);
      });
    });
  } else {
    console.log('Socket.IO server already running');
  }
  res.end();
}