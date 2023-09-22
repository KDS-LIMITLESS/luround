import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";

@Injectable()
export class DatabaseService {
  private static db: Db 
  userDB = this._uDB.collection('user')
  
  constructor(@Inject('MONGO_CONNECTION') private _uDB:Db) {}
  
  public async findOneDocument(searchParam: string) {
    const document = await this.userDB.findOne({ email: searchParam })
    return document || null
  }

  public async createDocument( data: any) {
    const result = await this.userDB.insertOne(data)
    return result.acknowledged ? result : undefined
  }
}