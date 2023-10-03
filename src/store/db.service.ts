import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";

@Injectable()
export class DatabaseService { 
  userDB = this._uDB.collection('user')

  constructor(@Inject('MONGO_CONNECTION') private _uDB:Db) {}
  
  public async findOneDocument(searchParam: string, value: string) {
    const document = await this.userDB.findOne({ [searchParam]: value }, { projection: { password: 0 }})
    return document || null
  }

  public async createDocument( data: any) {
    const result = await this.userDB.insertOne(data)
    return result.acknowledged ? result : undefined
  }

  /**
   * Updates a user certificates or media-links section in the profile with the specified fields. 
   */
  async updateUserDocument(email: string, alias:string, ...args: any) {
    let data: any;
    if (
      alias === "about" || alias === "occupation" || 
      alias === "firstName" || "lastName" || alias === "luround_url"
    ){
      data = args[0]
    }
    const update = await this.userDB.findOneAndUpdate(
        { email: email }, 
        { $set: {[alias]: data}},
        {returnDocument: "after", projection: {password: 0}}
      )
    return update.value
  }

  /**
   * Returns a user profile if email is found in db
   */
  async getUserDocument(email: string) {
   const profile = await this.userDB.findOne({ email })
    return profile ? profile : null
  }

}
