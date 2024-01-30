import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { DatabaseService } from "../store/db.service.js";
import { AuthService } from "../auth/auth.service.js";
import { ProfileService } from "../profileManager/profile.service.js";


@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, DatabaseService, ProfileService, AuthService]
})

export class UserModule {}