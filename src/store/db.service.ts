import { Inject, Injectable } from "@nestjs/common";
import { Db } from "mongodb";

@Injectable()
export class DatabaseService {
  constructor(@Inject('MONGO_CONNECTION') private db:Db) {}
}