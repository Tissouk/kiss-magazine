// lib/websocket.ts
import { Server } from 'socket.io';

export function setupWebSocketServer(server: any) {
  const io = new Server(server);
  
  io.on('connection', (socket) => {
    socket.on('join-community', (roomId) => {
      socket.join(`community-${roomId}`);
    });
    
    socket.on('new-comment', async (data) => {
      const comment = await createComment(data);
      io.to(`community-${data.postId}`).emit('comment-added', comment);
    });
  });
}