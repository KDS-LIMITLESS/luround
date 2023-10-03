import { BadRequestException, Injectable } from "@nestjs/common";
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";


@Injectable()
export class ProfileService {

  constructor(private profileManager: DatabaseService) {}

  async update_user_certificates(req: any) {
    const {email, certificates} = req
    let cert: ICertificates[] = []

    for (const certificate of certificates) {
      cert.push(certificate)
    }
    
    let data = await this.profileManager.updateUserDocument(email, "certificates", certificates)
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_media_links(req: any) {
    const {email, media_links} = req
    let media_link: ILinks[] = []
    
    for (const link of media_links ) {
      media_link.push(link)
    }
    
    let data = await this.profileManager.updateUserDocument(email,"media_links", media_link)
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_description(req: any) {
    const{email, about} = req
    let data = await this.profileManager.updateUserDocument(email, "about", about )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_first_name(req: any) {
    const{email, firstName, lastName} = req
    let data = await this.profileManager.updateUserDocument(email, "firstName", firstName, lastName )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_last_name(req: any) {
    const{email, firstName, lastName} = req
    let data = await this.profileManager.updateUserDocument(email, "lastName", lastName )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_occupation(req: any) {
    const{email, occupation} = req
    let data = await this.profileManager.updateUserDocument(email, "occupation", occupation )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }
  
  async getUserProfile(email: string) {
    let userProfile = await this.profileManager.findOneDocument("email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile
  }

  async generate_user_url(req: any) {
    try {
      const {email} = req
      let userCount = await this.profileManager.userDB.estimatedDocumentCount()
      let getUserNames = await this.profileManager.getUserDocument(email)
      let url = `luround.com/${getUserNames.firstName}_${getUserNames.lastName}_${userCount}`
      return await this.profileManager.updateUserDocument(email, "luround_url", url)

    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
  }

  async generate_custom_user_url(req: any) {
    const {email, slug} = req
    let user = await this.profileManager.getUserDocument(email)
    if (user === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    let custom_url = `luround.com/${slug}`
    return await this.profileManager.updateUserDocument(email, "luround_url", custom_url)
  }
  
  async get_user_link(req: any) {
    const {link} = req
    let user = await this.profileManager.findOneDocument("luround_url", link)

    if (user === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.BrokenLinkUrl
      })
    }
    return user
  }
}