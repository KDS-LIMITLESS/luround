import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller.js";
import { ProfileService } from "./profile.service.js";
import { DatabaseService } from "../store/db.service.js";

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [ProfileService, DatabaseService]
})

export class ProfileModule {}