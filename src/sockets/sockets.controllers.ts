import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { interval } from "rxjs";
import { JwtService } from "@nestjs/jwt";
import { InvoiceService } from '../invoice/invoice.services.js';
import { ProfileService } from '../profileManager/profile.service.js';
import { BookingsManager } from '../bookService/bookService.sevices.js';
import { ServicePageManager } from '../servicePage/services-page.service.js';
import { QuotesService } from '../quotes/quote.services.js';
import { ReceiptService } from '../receipt/receipt.services.js';

@WebSocketGateway()
export class SocketsConn implements OnGatewayInit, OnGatewayDisconnect {
  constructor(
    private jwt: JwtService, private invoiceService: InvoiceService, private profileManager: ProfileService,
    private bookingsManager: BookingsManager, private serviceManager: ServicePageManager,
    private quoteService: QuotesService, private receiptService: ReceiptService
    ) {}
  @WebSocketServer() server: Server;

  public connectedClients: {[key: string]: string} = {}
  
  
  public async afterInit(server: Server) {
    server.on("connection", async (client) => {
      let header: any = client.handshake.headers.authorization
      if(header !== undefined && header.split(' ')[0] === 'Bearer') {
        this.jwt.verifyAsync(header.split(' ')[1], {secret: process.env.JWT_SECRET_KEY})
        .then( (decodedToken) => {
          this.connectedClients[client.id] = decodedToken.userId
        })
        .catch( () => {
          client.emit("connection", {status: 401, message: "Unauthorized"})
          client.disconnect()
        })
      } else {
        delete this.connectedClients[client.id]
        client.disconnect(true)
      }
    })
  }

  public async handleDisconnect(client: any) {
    delete this.connectedClients[client.id]
    console.log(this.connectedClients)
  }

  // PROFILE SOCKETS

  @SubscribeMessage('user-profile')
  async socket_user_profile(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          // let profileQUery = client.handshake.query
          this.profileManager.get_user_profile_by_id(this.connectedClients[client.id])
          .then( async (userProfile) => {
            client.emit("user-profile", userProfile)
          })
          .catch( () => {
            client.emit("user-profile", "Email not found!")
            client.disconnect()
          })
        })
      }
    } catch(err) {
      client.emit("user-profile", err.message)
      client.disconnect()
    }
  }

  //  BOOKING SOCKETS

  @SubscribeMessage('user-bookings')
  async socket_user_bookings(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let bookings = await this.bookingsManager.get_user_service_bookings(this.connectedClients[client.id])
          client.emit("user-bookings", bookings)
        })
      } else {
        client.disconnect()
        client.emit("user-bookings", {status: 401, message: "Unauthorized"} )
      }
    } catch(err) {
      client.disconnect()
      client.emit("user-bookings", err.message)
    }
  }


  // SERVICE SOCKETS

  @SubscribeMessage('user-services')
  async socket_user_services(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          // let url: any = client.handshake.query.url
          this.serviceManager.get_user_services_(this.connectedClients[client.id])
          .then( async (service) => {
            client.emit("user-services", service)
          })
          .catch(async () => {
            client.emit("user-services", "URL Not Found!")
            client.disconnect()
          })
        })
      } else {
        client.emit("user-services", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      return err.message
    }
  }

    // INVOICE SOCKETS

  @SubscribeMessage('user-paid-invoices')
  async sockets_paid_invoices(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.invoiceService.get_paid_invoices(this.connectedClients[client.id])
          client.emit("user-paid-invoices", invoices)
        })
      } else {
        client.emit("user-paid-invoices", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit("user-paid-invoices", err.message)
      client.disconnect()
    }
  }

  @SubscribeMessage('user-unpaid-invoices')
  async sockets_unpaid_invoices(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.invoiceService.get_unpaid_invoices(this.connectedClients[client.id])
          client.emit("user-unpaid-invoices", invoices)
        })
      } else {
        client.emit("user-unpaid-invoices", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit("user-unpaid-invoices", err.message)
      client.disconnect()
    }
  }


  // QUOTE SOCKETS
  @SubscribeMessage('user-sent-quotes')
  async sockets_sent_quotes(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.quoteService.get_sent_quotes(this.connectedClients[client.id])
          client.emit("user-sent-quotes", invoices)
        })
      } else {
        client.emit("user-sent-quotes", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit("user-sent-quotes", err.message)
      client.disconnect()
    }
  }


  @SubscribeMessage('user-received-quotes')
  async sockets_received_quotes(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.quoteService.get_received_quotes(this.connectedClients[client.id])
          client.emit("user-received-quotes", invoices)
        })
      } else {
        client.emit("user-received-quotes", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit("user-received-quotes", err.message)
      client.disconnect()
    }
  }


  @SubscribeMessage('user-saved-quotes')
  async sockets_saved_quotes(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.quoteService.get_saved_quotes(this.connectedClients[client.id])
          client.emit("user-saved-quotes", invoices)
        })
      } else {
        client.emit("user-saved-quotes", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit("user-saved-quotes", err.message)
      client.disconnect()
    }
  }

  // RECEIPTS SOCKETS 

  @SubscribeMessage('user-saved-receipts')
  async sockets_saved_receipts(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.receiptService.get_saved_receipts(this.connectedClients[client.id])
          client.emit("user-saved-receipts", invoices)
        })
      } else {
        client.emit("user-saved-receipts", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit('user-saved-receipts', err.message)
      client.disconnect()
    }
  }

  @SubscribeMessage('user-receipts')
  async receiptsreceipts(@ConnectedSocket() client: Socket): Promise<any> {
    try {
      if (Object.keys(this.connectedClients).includes(client.id)) {
        interval(30000).subscribe(async() => {
          let invoices = await this.receiptService.get_saved_receipts(this.connectedClients[client.id])
          client.emit("userreceipts", invoices)
        })
      } else {
        client.emit("user-receipts", {status: 401, message: "Unauthorized"} )
        client.disconnect()
      }
    } catch(err) {
      client.emit('user-receipts', err.message)
      client.disconnect()
    }
  }
}