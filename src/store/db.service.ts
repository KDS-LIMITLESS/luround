import { Inject, Injectable } from "@nestjs/common";
import { Collection, Db, ObjectId, PushOperator, UpdateFilter } from "mongodb";


@Injectable()
export class DatabaseService { 
  userDB = this._db.collection('user')
  serviceDB = this._db.collection("services")
  bookingsDB = this._db.collection("bookings")
  transactionsDb = this._db.collection("transactions")
  reviewsDB = this._db.collection("reviews")
  walletDB = this._db.collection("wallet")
  feedbackDB = this._db.collection("feedback")
  payment = this._db.collection("payments")
  quotes = this._db.collection("quotes")
  invoiceDB = this._db.collection("invoice")
  notificationsDB = this._db.collection("notifications")
  receiptsDB = this._db.collection("receipts")
  crmDB = this._db.collection("crm")
  
  constructor(@Inject('MONGO_CONNECTION') private _db:Db) {}
  
  /**
   * Return a single document in specified db collection where data matches the searchParam
   * @param db Collection to query for document
   * @param searchParam Search filter to query in the document
   * @param value Data value to search for in the document.
   * @returns 
   */
  public async findOneDocument(db:Collection<Document | any>, searchParam: string, value: string): Promise<any | null> {
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
   * @param searchParam
   * @param arr_name Name of arry to push data to 
   * @param data 
   * @returns 
   */
  async updateArr(db: Collection<Document | any>, searchParam: string,  value: any, arr_name: string, data: Array<object>) {
    let update: any;
     
    data.forEach(async (element) => {
      update = {$push: {[arr_name]: element} }
      await db.findOneAndUpdate(
        {[searchParam]: value}, 
        update, 
        {returnDocument: "after", projection: {password: 0}}
      )
    })
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
   * Update a property in a document 
   * @param db Database collection to update a document
   * @param documentId Id of the document to update
   * @param updateProperty Propperty key to update 
   * @param data new property value 
   * @returns 
   */
  async updateProperty(db: Collection<Document | any>, documentId: string, updateProperty: string, data: { [key: string]: any} ){
    let result = await db.updateOne(
      {_id: new ObjectId(documentId)}, 
      {$set: data}
    )
    return result
  }

  /**
   * Deletes an object in an array
   * @param db Database collection to delete from
   * @param documentId
   * @param propKey Name of array property to delete item from  
   * @param data A unique value in the user service used to mark a document for removal
   * @returns 
   */
  async deletefromArray(db: Collection<Document | any>, documentId:string, propKey: string, data: any) {
    let result = await db.updateOne({_id: new ObjectId(documentId)},
      {$pull: {[propKey]: data}}
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

  async readAndWriteToArray(db: Collection<Document | any>, filterParam: string, value: string) {
   const profile = await db.find({ [filterParam]: value }).toArray()
    return profile ? profile : null
  }

}
