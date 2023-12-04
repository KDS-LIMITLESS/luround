import { BadRequestException, Injectable } from "@nestjs/common";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class ProfileService {

  _udb = this.profileManager.userDB

  constructor(private profileManager: DatabaseService) {}

  async update_user_certificates(user: any, certificates: any) {
    try {
      const { email } = user
      await this.profileManager.updateArr(this._udb, email, "certificates", certificates).then(() => {
        return "New certificate added"
      })
    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: err.message
      })
    }
  }

  async update_user_media_links(user:any, media_links: any) {
    try {
      const { email } = user
      await this.profileManager.updateArr(this._udb, email, "media_links", media_links).then(() => {
        return "New link added"
      })
    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: err.message
      })
    }
  }

  async update_user_about(user: any, about: string) {
    const { email } = user
    let data = await this.profileManager.update(this._udb, email, "about", about )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_personal_details(user: any, details: any) {
    const { userId } = user
    let personalDetails = {
      displayName: details.firstName + " " + details.lastName,
      occupation: details.occupation,
      company: details.company
    }

    let data = await this.profileManager.updateProperty(this._udb, userId, "", personalDetails )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }


  async update_user_profile_photo(user: any, photoUrl: string) {
    const { email } = user
    let data = await this.profileManager.update(this._udb, email, "photoUrl", photoUrl )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }
  
  async get_user_profile(user: any) {
    const { email } = user
    let userProfile:any = await this.profileManager.findOneDocument(this._udb, "email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    const {otp, ...profile} = userProfile
    return profile
  }

  async get_user_certs(userId: string) {
    let userProfile: any = await this.profileManager.findOneDocument(this._udb, "_id", userId)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile.certificates
  }

  // async get_user_about(email: string) {
  //   let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
  //   if (userProfile === null) {
  //     throw new BadRequestException({
  //       status: 400,
  //       message: ResponseMessages.EmailDoesNotExist
  //     })
  //   }
  //   return userProfile.about
  // }

  // async get_user_occupation(email: string) {
    
  //   let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
  //   if (userProfile === null) {
  //     throw new BadRequestException({
  //       status: 400,
  //       message: ResponseMessages.EmailDoesNotExist
  //     })
  //   }
  //   return userProfile.occupation
  // }

  // async get_user_media_links(email: string) {
  //   // const {email} = req
  //   let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
  //   if (userProfile === null) {
  //     throw new BadRequestException({
  //       status: 400,
  //       message: ResponseMessages.EmailDoesNotExist
  //     })
  //   }
  //   return userProfile.media_links
  // }

  async generate_user_url(user: any) {
    const { email } = user
    try {
      // const {email} = req
      // GET DOCUMENT COUNT IN DB
      let userCount = await this.profileManager.userDB.estimatedDocumentCount()
      let getUserNames = await this.profileManager.read(this._udb, email)
      // BUILD THE USER URL 
      let url = `luround.com/${getUserNames.displayName.replace(/\s/g, '_')}_${userCount}`
      await this.profileManager.update(this._udb, email, "luround_url", url)
      return url

    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
  }

  async generate_custom_user_url(user: any, slug: string) {
    const { email } = user
    let isUser = await this.profileManager.read(this._udb, email)
    if (isUser === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    let custom_url = `luround.com/${slug.replace(/\s/g, '')}`
    await this.profileManager.update(this._udb, email, "luround_url", custom_url)
    return custom_url
  }
  
  async get_user_profile_by_link(url: string) {

    let user = await this.profileManager.findOneDocument(this._udb ,"luround_url", url)

    if (user === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.BrokenLinkUrl
      })
    }
    return user
  }

  async deleteElementFromArray(user: any, arrayName: string, data: any) {
    const { userId } = user
    let delElem = await this.profileManager.deletefromArray(this._udb, userId, arrayName, data)
    if (delElem.modifiedCount === 1) return "Item Deleted"
    throw new BadRequestException({message: "Item not found in array."})
  }
}

// class Certificate {

//   static async transformCertificates(certificateObj: CertificateValidationDto): Promise<boolean> {
//     let id = await this.generateCertificateID()
//     console.log(id)
//     return Object.defineProperty(certificateObj, "certificateID", {
//       enumerable: true,
//       value: id
//     }) ? true: false
//   }

//   static async generateCertificateID(): Promise<number> {
//     // Generate a random number between 100,000 (inclusive) and 1,000,000 (exclusive)
//     const randomInt = Math.floor(Math.random() * 90000000) + 10000000;
//     return randomInt;
//   }
// }

