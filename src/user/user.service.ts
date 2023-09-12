import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/store/db.service';
import { IGoogleAccount } from './interface/user.interface';
import { AuthService } from 'src/auth/auth.service';


@Injectable()
export class UserService {

  constructor(
    private jwt: JwtService, 
    private db: DatabaseService,
    private authService: AuthService
  ) {}

  async googleSignIn(user: IGoogleAccount): Promise<string> {
    user = {
      email:user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      accountCreatedFrom: 'GOOGLE'
    }
    
    if (await this.db.findOneDocument('user', user.email)) {
      return this.jwt.sign({email: user.email, picture: user.picture})
    }
    await this.db.createDocument('user', user)
    return this.jwt.sign({email: user.email, picture: user.picture})
  }

  async localSignUp(user: IGoogleAccount): Promise<object | false>{
    const isUser = await this.db.findOneDocument('user', user.email)
    if (isUser) throw new BadRequestException({
      statusCode: 400,
      message: "Email already exists!"
    })
    const PSW_HASH = await this.authService.hashPassword(user.password)
    user = {
      email:user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
      password: PSW_HASH,
      accountCreatedFrom: "LOCAL"
    }
    // Check if the user has been successfully registered
    const newuser = (await this.db.createDocument('user', user)).acknowledged
    return newuser ? {email: user.email, picture: user.picture, created: true} : false
  }

  async login(user: IGoogleAccount): Promise<string> {
    // CHECK IF USER EMAIL EXISTS IN DB
    const isUser = await this.db.findOneDocument('user', user.email)    
  
    // AN ERROR OCCURED PLAIN PASSWORD AND HASH DOES NOT MATCH
    if (isUser === null || 
        !await this.authService.comparePasswords(user.password, isUser.password)
      ){
      throw new BadRequestException({
        statusCode: 400,
        message: "Invalid login details"
      })
    }
    // SUCCESS GENERATE A USER TOKEN 
    return this.jwt.sign({email: isUser.email, picture: isUser.picture})
  }
}