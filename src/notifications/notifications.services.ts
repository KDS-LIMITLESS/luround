import { Injectable } from '@nestjs/common';
import { WebSocketGateway } from '@nestjs/websockets'
import { DatabaseService } from 'src/store/db.service.js';

@Injectable()
export class NotificationsService {
  pipeline = [
    {
      $match:{operationType: 'insert'}
    }
  ]
  _nSDB = this.notifications_service.bookingsDB.watch(this.pipeline)
  constructor(private notifications_service: DatabaseService ) {}

  async send_bookings_notifications() {
    this._nSDB.on('change', (next) => {
      console.log('OK running')
    })
  }
}
