
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const app = initializeApp()

export class NotificationService {
  constructor() {}

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