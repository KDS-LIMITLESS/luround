import { Injectable } from "@nestjs/common";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";
import { SendFeedBackEmail } from "src/utils/mail.services.js";


@Injectable()
export class FeedBackService {

  _fdb = this.databaseManager.feedbackDB
  constructor(private databaseManager: DatabaseService) {}

  async record_feedback(user: any, data: any){
    const {displayName, userId, email} = user
    await this.databaseManager.create(this._fdb, {userId, displayName, feed_back: data})
    await SendFeedBackEmail(email, displayName.split(' ')[0], data.subject, data.description)
    return ResponseMessages.FeedBackRecorded
  }

  async get_feedBacks() {
    return this._fdb.find().toArray()
  }
}