import { Injectable } from "@nestjs/common";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";


@Injectable()
export class NotificationService {
  constructor() {
    process.env.GOOGLE_APPLICATION_CREDENTIALS
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FCM_PROJECT_ID
    })
  }

  async send_notification(userNToken: string) {
    const message = {
      notification: {
        title: "Luround Notification",
        body: "Body coming"
      },
      token: userNToken
    }

    let sendNotification = await getMessaging().send(message)
    console.log(sendNotification)
    return sendNotification
  }
}