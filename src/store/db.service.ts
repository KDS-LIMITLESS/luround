import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";

@Injectable()
export class DatabaseService {

  constructor(@Inject('MONGO_CONNECTION') private db:Db) {}

  public getDbCollection(collectionName: string) {
    return this.db.collection(collectionName)
  }
}