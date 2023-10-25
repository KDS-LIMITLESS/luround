import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";
import { AuthDto } from "./authDto";


@Injectable()
export class AuthService {

  _udb = this.userManager.userDB
  constructor( 
    private userManager: DatabaseService,
    private jwt: JwtService
  ) {}

  async login(user: any ): Promise<object> {    
    let payload = { email: user.email, sub: user._id, displayName: user.displayName }
    return { "accessToken": await this.jwt.signAsync(payload) }
  }

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