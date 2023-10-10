import { Inject, Injectable } from "@nestjs/common";
import { Collection, Db } from "mongodb";

@Injectable()
export class DatabaseService { 
  userDB = this._uDB.collection('user')
  serviceDB = this._uDB.collection("services")

  constructor(@Inject('MONGO_CONNECTION') private _uDB:Db) {}
  
  public async findOneDocument(db:Collection<Document | any>, searchParam: string, value: string) {
    const document = await db.findOne({ [searchParam]: value }, { projection: { password: 0 }})
    console.log(document)
    return document || null
  }

  public async create(db: Collection<Document | any>, data: any) {
    const result = await db.insertOne(data)
    return result.acknowledged ? result : undefined
  }

  /**
   * Updates a user certificates or media-links section in the profile with the specified fields. 
   */
  async update(db: Collection<Document | any>, email: string, alias:string, ...args: any) {
    let data: any;
    if (alias === "about" || alias === "occupation" || "displayName" || alias === "luround_url" || alias === "services") {
      data = args[0]
    }
    console.log(args[0], email)
    const update = await db.findOneAndUpdate(
      { email: email }, 
      { $set: {[alias]: data}},
      {returnDocument: "after", projection: {password: 0}}
    )
    return update.value
  }

  async updateArr(db: Collection<Document | any>, email: string, data: any) {
    let arr = await db.findOneAndUpdate({email: email}, {$push: data[0] }, {returnDocument: "after", projection: {password: 0}})
    return arr.value
  }

  /**
   * Returns a user profile if email is found in db
   */
  async read(db: Collection<Document | any>, email: string) {
    console.log(email)
   const profile = await db.findOne({ email })
    return profile ? profile : null
  }

}
