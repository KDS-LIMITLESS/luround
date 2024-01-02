import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { DatabaseService } from "../store/db.service.js";

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

  async construct_notification_detail(user_nToken: string, title: string, body: string) {
    const message = {
      notification: {
        title: title,
        body: body
      },
      token: user_nToken
    }
    this.send_notification(message)
  }
}


