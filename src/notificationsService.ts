import { Injectable } from '@nestjs/common';
import { MongoClient, ChangeStream } from 'mongodb';
import { Server, createServer } from 'http';
import { MessageBody, WebSocketGateway, OnGatewayInit, SubscribeMessage, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server as Serv } from 'socket.io';


@Injectable()
export class CustomNotificationService {
  private client: MongoClient;
  private changeStream: ChangeStream;
  private httpServer: Server;
  private clients: Set<any> = new Set();

  constructor() {
    this.sendNotifications();
    this.createHttpServer();
  }

  async sendNotifications() {
    this.client = await MongoClient.connect(process.env.MONGO_ATLAS_DB);
    const db = this.client.db(process.env.DATABASE_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME)

    this.changeStream = collection.watch();

    this.changeStream.on('change', (change) => {
      // SEND NOTIFICATIONS TO CONNECTED CLIENTS
      this.sendSSEToClients({ change });
    });
  }

  createHttpServer() {
    console.log("server connected!>>>>..........")
    this.httpServer = createServer((req, res) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // KEEP CLIENTS ALIVE UNTIL AFTER 15000
      setInterval(() => res.write('\n'), 15000);
    });
    this.httpServer.listen(0 || process.env.PORT);
  }

  addClient(client: any) {
    this.clients.add(client);

    //CLOSE AND REMOVE CLIENT
    client.on('close', () => {
      this.clients.delete(client);
    });
  }

  sendSSEToClients(data: any) {
    this.clients.forEach((client) => {
      // Send SSE to connected clients
      let arr = Object.values(data)
      // let values  = arr[0]['fullDocument']
      let values = {[arr[0]['operationType']]: arr[0]}
      client.write(`data: ${JSON.stringify(values)}\n\n`);
    });
  }
}