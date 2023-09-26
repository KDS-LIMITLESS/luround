import { BadRequestException, Injectable } from "@nestjs/common";
import { ProfileManager } from "./profile.db";
import { IUser } from "src/user/interface/user.interface";


@Injectable()
export class ProfileService {

  constructor(private profileManager: ProfileManager) {}

  async update_user_certificates(req: any) {
    const {email, certificates} = req
    let cert = []

    for (const certificate of certificates) {
      cert.push(certificate)
    }
    
    let data = await this.profileManager.updateUserDocument(email, "certificates", certificates)
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: "A user with specified email not found"
      })
    }
    return data
  }

  async update_user_media_links(req: any) {
    const {email, media_links} = req
    let media_link = []
    
    for (const link of media_links ) {
      media_link.push(link)
    }
    
    let data = await this.profileManager.updateUserDocument(email,"media_links", media_link)
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: "A user with specified email not found"
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
        message: "A user with specified email not found"
      })
    }
    return data
  }

  async update_user_name(req: any) {
    const{email, firstName, lastName} = req
    let data = await this.profileManager.updateUserDocument(email, "full_name", firstName, lastName )
    if (data === null) {
      throw new BadRequestException({
        status: 400,
        message: "A user with specified email not found"
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
        message: "A user with specified email not found"
      })
    }
    return data
  }
  
  async getUserProfile(email: string) {
    let userProfile = await this.profileManager.getProfile(email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: "A user with specified email not found"
      })
    }
    return userProfile
  }
}