import { BadRequestException, Injectable } from "@nestjs/common";
import { ProfileManager } from "./profile.db";
import { IUser } from "src/user/interface/user.interface";


@Injectable()
export class ProfileService {

  constructor(private profileManager: ProfileManager) {}

  async updateUserProfie(req: any) {
    const { email, occupation, about, certificates, media_links} = req
    return await this.profileManager.update(email, occupation, about, certificates, media_links)
  }

  async getUserProfile(email: string) {
    let userProfile = await this.profileManager.getProfile(email)
    if (userProfile === null) {
      throw new BadRequestException({
        status: 400,
        message: "Are you logged in?"
      })
    }
    return userProfile
  }
}