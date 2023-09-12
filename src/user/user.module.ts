import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DatabaseService } from "src/store/db.service";
import { AuthService } from "src/auth/auth.service";


@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, DatabaseService, AuthService]
})

export class UserModule {}