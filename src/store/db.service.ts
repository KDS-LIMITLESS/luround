import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";

@Injectable()
export class DatabaseService {

  
  userCollection = this.db.collection('users')
  constructor(@Inject('MONGO_CONNECTION') private db:Db) {}

  public async getDbCollection(collectionName: string) {
    return this.db.collection(collectionName)
  }

  public async findOneDocument(collection: string, searchParam: string) {
    const document = await (await this.getDbCollection(collection)).findOne(
      { email: searchParam }
    )
    return document
  }

  public async createDocument(collection: string, data: any) {
    const result = await (await this.getDbCollection(collection)).insertOne(data)
    return result.acknowledged ? result : undefined
  }
}