import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DatabaseService } from "src/store/db.service";


@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, DatabaseService]
})

export class UserModule {}