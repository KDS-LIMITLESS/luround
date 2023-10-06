import { Inject, Injectable } from "@nestjs/common";
import { Collection, Db } from "mongodb";

@Injectable()
export class DatabaseService { 
  userDB = this._uDB.collection('user')
  serviceDB = this._uDB.collection("services")

  constructor(@Inject('MONGO_CONNECTION') private _uDB:Db) {}
  
  public async findOneDocument(db:Collection<Document | any>, searchParam: string, value: string) {
    const document = await db.findOne({ [searchParam]: value }, { projection: { password: 0 }})
    return document || null
  }

  public async create( data: any) {
    const result = await this.userDB.insertOne(data)
    return result.acknowledged ? result : undefined
  }

  /**
   * Updates a user certificates or media-links section in the profile with the specified fields. 
   */
  async update(email: string, alias:string, ...args: any) {
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
  async read(email: string) {
   const profile = await this.userDB.findOne({ email })
    return profile ? profile : null
  }

}
