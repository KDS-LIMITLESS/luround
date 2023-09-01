import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";
import { IUser } from "./db.interfaces";

@Injectable()
export class DatabaseService {

  userCollection = this.db.collection('users')
  constructor(@Inject('MONGO_CONNECTION') private db:Db) {}

  public async getDbCollection(collectionName: string) {
    return this.db.collection(collectionName)
  }

  public async findOneDocument(searchParam: string) {
    const document = (await this.getDbCollection('users')).findOne(
      {
        email: searchParam
      }
    )
    return document
  }

  public async createDocument(data: IUser) {
    const result = await this.userCollection.insertOne(data)
    return result.acknowledged ? result : undefined
  }
}