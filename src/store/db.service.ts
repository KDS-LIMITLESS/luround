import { Inject, Injectable } from "@nestjs/common";
import { Collection, Db, PushOperator } from "mongodb";

@Injectable()
export class DatabaseService { 
  userDB = this._uDB.collection('user')
  serviceDB = this._uDB.collection("services")

  constructor(@Inject('MONGO_CONNECTION') private _uDB:Db) {}
  
  /**
   * Return a single document in specified db collection where data matches the searchParam
   * @param db Collection to query for document
   * @param searchParam Search filter to query in the document
   * @param value Data value to search for in the document.
   * @returns 
   */
  public async findOneDocument(db:Collection<Document | any>, searchParam: string, value: string) {
    const document = await db.findOne({ [searchParam]: value }, { projection: { password: 0 }})
    console.log(document)
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
    console.log(args[0], email)
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
   * @param data 
   * @returns 
   */
  async updateArr(db: Collection<Document | any>, email: string, data: PushOperator<any>) {
    let arr = await db.findOneAndUpdate({email: email}, {$push: {services: data[0] } }, {returnDocument: "after", projection: {password: 0}})
    return arr.value
  }

  /**
   * Updates the serrvices page document 
   * @param db 
   * @param email 
   * @param query_service_name The user service_name to update in document
   * @param data converts all other paramenters enterd to an array, to be used for updating document fields
   * @returns 
   */
  async updateService(db: Collection<Document | any>, email: string, query_service_name: string,  ...data: any){
    let result = await db.updateOne({email: email, "services.service_name": query_service_name}, 
      {$set: {
        "services.$.service_name": data[0],
        "services.$.description": data[1],
        "services.$.links": data[2],
        "services.$.service_charge_virtual": data[3],
        "services.$.service_charge_in_person": data[4],
        "services.$.duration": data[5],
        "services.$.schedule_type": data[6],
        "services.$.date": data[7],
      }}
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
    console.log(data)
    let result = await db.updateOne({email: email, "services.service_name": data},
      {$pull: {"services": {"service_name": data}}}
  )
    return result
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
