import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { Auth0Strategy } from "../../config/auth0.config";
import { DatabaseModule } from "../database/database.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [PassportModule, DatabaseModule],
  controllers: [UserController],
  providers: [UserService, Auth0Strategy],
  exports: [UserService],
})
export class UserModule {}
