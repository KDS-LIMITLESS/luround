import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { DatabaseService } from "src/store/db.service";

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [ProfileService, DatabaseService]
})

export class ProfileModule {}