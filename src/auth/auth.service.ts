import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class AuthService {

  _udb = this.userManager.userDB
  constructor( 
    private userManager: DatabaseService,
    private jwt: JwtService
  ) {}

  async login(user: any ): Promise<object> {    
    let payload = { email: user.email, sub: user._id, displayName: user.displayName, media_links: user.media_links }
    return { "accessToken": await this.jwt.signAsync(payload) }
  }

  // validate user details before logging in
   async validateUser(email: string, psw: string) {
    const isUser = await this.userManager.read(this._udb, email)  
    if ( isUser === null || !await this.comparePasswords(psw, isUser.password) ){
      throw new UnauthorizedException({
        statusCode: 401,
        message: ResponseMessages.BadLoginDetails
      })
    }
    const {password, ...userDetails} = isUser
    return userDetails
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  async comparePasswords(plainPassword: string, passwordHash:string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash)
  }
}