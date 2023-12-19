import { Injectable } from "@nestjs/common";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class FeedBackService {

  _fdb = this.databaseManager.feedbackDB
  constructor(private databaseManager: DatabaseService) {}

  async record_feedback(user: any, data: any){
    const {displayName, userId} = user
    await this.databaseManager.create(this._fdb, {userId, displayName, feed_back:data})
    return ResponseMessages.FeedBackRecorded
  }

  async get_feedBacks() {
    return this._fdb.find().toArray()
  }
}