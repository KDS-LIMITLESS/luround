import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'


@Injectable()
export class AuthService {

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  }

  async comparePasswords(plainPassword: string, passwordHash:string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, passwordHash)
  }
}