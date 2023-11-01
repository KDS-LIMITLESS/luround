import { Inject, Injectable } from "@nestjs/common";
import { Collection, Db, ObjectId, PushOperator } from "mongodb";

@Injectable()
export class DatabaseService { 
  userDB = this._uDB.collection('user')
  serviceDB = this._uDB.collection("services")
  bookingsDB = this._uDB.collection("bookings")

  constructor(@Inject('MONGO_CONNECTION') private _uDB:Db) {}
  
  /**
   * Return a single document in specified db collection where data matches the searchParam
   * @param db Collection to query for document
   * @param searchParam Search filter to query in the document
   * @param value Data value to search for in the document.
   * @returns 
   */
  public async findOneDocument(db:Collection<Document | any>, searchParam: string, value: string) {
    if (searchParam === "_id") {
      const document = await db.findOne({ _id: new ObjectId(value) }, { projection: { password: 0 }})
      return document || null
    }
    const document = await db.findOne({ [searchParam]: value }, { projection: { password: 0 }})
    return document || null
  }

  /**
   * Inserts a new document in any specified database collection
   * @param db Collection to insert new document
   * @param data Data to insert into the collection
   * @returns 
   */
  public async create(db: Collection<Document | any>, data: any) {
    const result = await db.insertOne(data)
    return result.acknowledged ? result : undefined
  }

  /**
   * Updates a specified document in specified db collection. 
   * @param db Document to update
   * @param email 
   * @param alias The field name to update
   * @param args converts all other parameters to an array for updating specified document.
   * @returns 
   */
  async update(db: Collection<Document | any>, email: string, alias:string, ...args: any) {
    let data: any;
    if (alias === "about" || alias === "occupation" || "displayName" || alias === "luround_url" || alias === "services") {
      data = args[0]
    }
    const update = await db.findOneAndUpdate(
      { email: email }, 
      { $set: {[alias]: data}},
      {returnDocument: "after", projection: {password: 0}}
    )
    return update.value
  }

  /**
   * Pushes to and updates an array field in specified document
   * @param db 
   * @param email
   * @param arr_name Name of arry to push data to 
   * @param data 
   * @returns 
   */
  async updateArr(db: Collection<Document | any>, email: string, arr_name: string, data: PushOperator<any>) {
    let arr = await db.findOneAndUpdate(
      {email: email}, {$push: {[arr_name]: data[0] } }, 
      {returnDocument: "after", projection: {password: 0}}
    )
    return arr.value
  }

  /**
   * Finds and updates a document using id as filter
   * @param db 
   * @param documentId doument id to update
   * @param data converts all other paramenters enterd to an array, to be used for updating document fields
   * @returns 
   */
  async updateDocument(db: Collection<Document | any>, documentId: string, ...data: [{ [key: string]: any} ]){
    let result = await db.updateOne(
      {_id: new ObjectId(documentId)}, 
      {$set: data[0]}
    )
    return result
  }

  /**
   * Deletes a service from database
   * @param db Database collection to delete from
   * @param email 
   * @param data A unique value in the user service used to mark a document for removal
   * @returns 
   */
  async deleteService(db: Collection<Document | any>, email:string,  data: any) {
    let result = await db.updateOne({email: email, "services.service_name": data},
      {$pull: {"services": {"service_name": data}}}
  )
    return result
  }

  async delete(db: Collection<Document | any>, id: string) {
    let result = await db.findOneAndDelete({_id: new ObjectId(id)})
    return result
  }

  /**
   * Returns a user profile if email is found in db
   */
  async read(db: Collection<Document | any>, email: string) {
   const profile = await db.findOne({ email })
    return profile ? profile : null
  }

  async readAndWriteToArray(db: Collection<Document | any>, searchParam: string, value: string) {
   const profile = await db.find({ [searchParam]: value }).toArray()
    return profile ? profile : null
  }

}
