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


interface IProfile {
  email: string,
  firstName: string
  lastName: string
  about?: string
  certificates?: ICertificates[]
  media_links?: ILinks[]
}

@Injectable()
export class ProfileManager {
  
  userDB = this._uDB.collection('user') 
  constructor(@Inject('MONGO_CONNECTION') private _uDB: Db) {}
  
  /**
   * Updates a user profile with the specified fields. 
   * @param email 
   * @param occupation 
   * @param about 
   * @param certificates 
   * @param media_links 
   * @returns 
   */
  async update(email:string, occupation:string, about:string, certificates:[], media_links:[]) {
    // IF USERS CHANGE THEIR USERNAMES, THEIR CUSTOMISED INK HAS TO CHANGE AND THE QR CODE. IF THEY PREVIOUSLY SHARED THEIR HANDLES THIS WILL CAUSE ISSUES.
    let certificateArr = []
    let mediaLinkArr = []

    for (const [certificate, media_link] of updateIterator(certificates, media_links)) {
      certificateArr.push(certificate); 
      mediaLinkArr.push(media_link)
    }
    return await this.userDB.findOneAndUpdate(
      { email: email }, 
      { $set: {about, occupation, certificateArr, mediaLinkArr }},
      { projection: { value: 1 } }
    )
  }

  async getProfile(email: string) {
   const profile = await this.userDB.findOne({ email }, { projection: { password: 0 }})
    return profile._id ? profile : null
  }
}

// ITERATOR FUNCTION FOR LOOPING THROUGH TWO ITERABLE VALUES
function* updateIterator<T1, T2>(iterable1: Iterable<T1>, iterable2: Iterable<T2>) {
  const iterator1 = iterable1[Symbol.iterator]()
  const iterator2 = iterable2[Symbol.iterator]()
  
  while(true) {
    const result1 = iterator1.next()
    const result2 = iterator2.next()

    if (result1.done && result2.done) {
      return;
    }
    // LOOP THROUGH THE TOGETHER AND RETURN A VALUE FROM BOTH IN A SINGLE ARRAY
    yield [result1.value, result2.value]
  }
}