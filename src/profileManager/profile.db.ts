import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";

interface ICertificates {
  certificationName: string
  issuingOrganization: string
  issueDate: string
}

interface ILinks {
  linkName: string
  url: string
}


@Injectable()
export class ProfileManager {
  
  userDB = this._uDB.collection('user') 
  constructor(@Inject('MONGO_CONNECTION') private _uDB: Db) {}
  
  /**
   * Updates a user certificates or media-links section in the profile with the specified fields. 
   */
  async updateUserDocument(email: string, alias:string, ...args: any) {
    let data: any;
    if (alias === "about" || alias === "occupation" || alias === "full_name") {
      data = args[0]
    }
    const update = await this.userDB.findOneAndUpdate(
        { email: email }, 
        { $set: {[alias]: data}},
        {returnDocument: "after"}
      )
    return update.value
  }

  /**
   * Returns a user profile if email is found in db
   */
  async getProfile(email: string) {
   const profile = await this.userDB.findOne({ email }, { projection: { password: 0 }})
    return profile._id ? profile : null
  }
}

// ITERATOR FUNCTION FOR LOOPING THROUGH TWO ITERABLE VALUES
// function* updateIterator<T1, T2>(iterable1: Iterable<T1>, iterable2: Iterable<T2>) {
//   const iterator1 = iterable1[Symbol.iterator]()
//   const iterator2 = iterable2[Symbol.iterator]()
  
//   while(true) {
//     const result1 = iterator1.next()
//     const result2 = iterator2.next()

//     if (result1.done && result2.done) {
//       return;
//     }
//     LOOP THROUGH THE TOGETHER AND RETURN A VALUE FROM BOTH IN A SINGLE ARRAY
//     yield [result1.value, result2.value]
//   }
// }