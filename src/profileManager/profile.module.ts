import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileManager } from "./profile.db";
import { ProfileService } from "./profile.service";

@Module({
  imports: [],
  controllers: [ProfileController],
  providers: [ProfileManager, ProfileService]
})

export class ProfileModule {}