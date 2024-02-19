import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketsConn {
  @WebSocketServer() server: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    console.log(client.connected)
    console.log(data)
    console.log(this.server.emit('message', data)); // Broadcast message to all connected clients
  }
}