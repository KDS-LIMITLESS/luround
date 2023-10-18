import { BadRequestException, Injectable } from "@nestjs/common";
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";
import { aboutDto, certificatesDto, customURLDto, displayNameDto, media_linksDto, occupationDto } from "./profile.dto";


@Injectable()
export class ProfileService {

  _udb = this.profileManager.userDB

  constructor(private profileManager: DatabaseService) {}

  async update_user_certificates(req: certificatesDto) {
    const {email, certificates} = req
    console.log(req)
    
    let data = await this.profileManager.update(this._udb, email, "certificates", certificates)
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_media_links(req: media_linksDto) {
    const {email, media_links} = req
  
    let data = await this.profileManager.update(this._udb, email,"media_links", media_links)
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_about(req: aboutDto) {
    const{email, about} = req
    let data = await this.profileManager.update(this._udb, email, "about", about )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }

  async update_user_display_name(req: displayNameDto) {
    const {email, displayName } = req
    let data = await this.profileManager.update(this._udb, email, "displayName", displayName )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }


  async update_user_occupation(req: occupationDto) {
    const{email, occupation} = req
    let data = await this.profileManager.update(this._udb, email, "occupation", occupation )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return data
  }
  
  async get_user_profile(email: string) {
    let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile
  }

  async get_user_certs(email: string) {
    let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile.certificates
  }

  async get_user_about(email: string) {
    let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile.about
  }

  async get_user_occupation(email: string) {
    
    let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile.occupation
  }

  async get_user_media_links(email: string) {
    // const {email} = req
    let userProfile = await this.profileManager.findOneDocument(this._udb, "email", email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return userProfile.media_links
  }

  async generate_user_url(email: string) {
    try {
      // const {email} = req
      // GET DOCUMENT COUNT IN DB
      let userCount = await this.profileManager.userDB.estimatedDocumentCount()
      let getUserNames = await this.profileManager.read(this._udb, email)
      // BUILD THE USER URL 
      let url = `luround.com/${getUserNames.displayName}_${userCount}`
      return await this.profileManager.update(this._udb, email, "luround_url", url)

    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
  }

  async generate_custom_user_url(req: customURLDto) {
    const {email, slug} = req
    let user = await this.profileManager.read(this._udb, email)
    if (user === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    let custom_url = `luround.com/${slug}`
    return await this.profileManager.update(this._udb, email, "luround_url", custom_url)
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
}