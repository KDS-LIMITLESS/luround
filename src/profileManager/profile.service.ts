import { BadRequestException, Injectable } from "@nestjs/common";
import { ProfileManager } from "./profile.db";
import { IUser } from "src/user/interface/user.interface";


@Injectable()
export class ProfileService {

  constructor(private profileManager: ProfileManager) {}

  async updateUserCertificatesOrMlinks(req: any) {
    const { email, occupation, about, certificates, media_links} = req
    let userProfile = await this.profileManager.updateCertsOrMLinks(email, certificates, media_links)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: "A user with specified email not found"
      })
    }
    return userProfile
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