import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/store/db.service';
import { IGoogleAccount } from './interface/user.interface';


@Injectable()
export class UserService {
  constructor(
    private jwt: JwtService, 
    private db: DatabaseService
  ) {}

  async googleSignIn(user: IGoogleAccount): Promise<string> {
    if (await this.db.findOneDocument('user', user.email)) {
      return this.jwt.sign({user})
    }
    await this.db.createDocument('user', user)
    return this.jwt.sign(user)
  }
}