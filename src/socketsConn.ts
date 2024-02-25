import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { interval } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway()
export class SocketsConn implements OnGatewayInit, OnGatewayDisconnect {
  constructor(private jwt: JwtService) {}
  @WebSocketServer() server: Server;

  public connectedClients: {[key: string]: string} = {}
  
  
  public async afterInit(server: Server) {
    server.on("connection", async (client) => {
      let header: any = client.handshake.headers.authorization
      if(header !== undefined && header.split(' ')[0] === 'Bearer') {
        this.jwt.verifyAsync(header.split(' ')[1], {secret: process.env.JWT_SECRET_KEY})
        .then( (decodedToken) => {
          this.connectedClients[client.id] = decodedToken.userId
          console.log(this.connectedClients)
        })
        .catch( () => {
          client.emit("connection", {status: 401, message: "Unauthorized"})
        })
      } else {
        delete this.connectedClients[client.id]
        client.disconnect(true)
      }
    })
  }

  public async handleDisconnect(client: any) {
    console.log(client.id)
    delete this.connectedClients[client.id]
    console.log(this.connectedClients)
  }
}