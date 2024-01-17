import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { DatabaseService } from "../store/db.service.js";
import { ObjectId } from "mongodb";

@Injectable()
export class NotificationService {
  _ndb = this.databaseService.notificationsDB

  constructor(private databaseService: DatabaseService) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FCM_PROJECT_ID
    })
  }

  async send_test_notification(userNToken: string) {
    const message = {
      notification: {
        title: "Luround Notification",
        body: "Body coming"
      },
      token: userNToken
    }

    this.send_notification(message)
  }

  async send_notification(message: any) {
    try {
      let sendNotification = await getMessaging().send(message)
      return sendNotification
    } catch(err: any) {
      throw new InternalServerErrorException({message: err})
    }
  }

  async construct_notification_detail(userIdTOSendNotificationTo: string, user_nToken: string, title: string, body: string) {
    const message = {
      notification: {
        title: title,
        body: body
      },
      token: user_nToken
    }
    await this.send_notification(message)
    await this.save_user_notification(userIdTOSendNotificationTo, title, body)
    return
  }

  async save_user_notification(userId: string, title: string, body: string) {
    const id = new ObjectId(userId)
    if (await this.databaseService.findOneDocument(this._ndb, "_id", userId)) {
      console.log(userId)
      await this.databaseService.updateArr(this._ndb, "_id", id, "notifications", [{title, body, created_at:Date.now()}])
      return "Array updated"
    }
    return await this.databaseService.create(this._ndb, {"_id": id, notifications: [{title, body, created_at: Date.now()}]})
  }

  async get_user_notifications(userId: string) {
    try {
      let user_notifications = await this._ndb.find({'_id': new ObjectId(userId)}).toArray()
      return user_notifications[0]['notifications']
    } catch (err: any) {
      return []
    }
   
  }
}
