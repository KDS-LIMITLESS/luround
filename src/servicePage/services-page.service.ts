import { BadRequestException, Injectable } from "@nestjs/common";
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";
import { ServiceDto } from "./servicePage.dto";

@Injectable()
export class ServicePageManager {
  // _spm_db ---> Service Page Manager_Database
  _spm_db = this.servicePageManager.serviceDB
  _udb = this.servicePageManager.userDB

  constructor(private servicePageManager: DatabaseService) {}

  async add_new_service(data: ServiceDto){
    
    let isUserExists = await this.servicePageManager.read(this._udb, data.email)
    if (isUserExists === null) {
      throw new BadRequestException({
        status:400, message: ResponseMessages.EmailDoesNotExist
      })  
    }
    const new_service = await this.servicePageManager.create(this._spm_db, data)
    return new_service
    // return await this.servicePageManager.updateArr(this._spm_db, email, service.services)
  }

  async edit_service(data: any, serviceId: string) {
   
    try {
      // UPDATE DOCUMENT IN DATABASE IF FOUND.
      if ((await this.servicePageManager.updateDocument(this._spm_db, serviceId, data)).matchedCount === 1)   
      return ResponseMessages.ServiceUpdated

      // ID DOES NOT EXISTS OR ID IS NOT VALID ObjectId 
      throw Error; 
    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.InvalidServiceId
      })
    }    
  }
  // Add created_at and updated_at values
  // Add service link

  async delete_service(id: string) {
    try {
      let deleted = await this.servicePageManager.delete(this._spm_db, id )
      if (deleted.value !== null) return ResponseMessages.ServiceDeleted
      throw Error
    } catch(err: any) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.InvalidServiceId
      })
    }
    
  }

  // This function queries and returns all user services where email equals user email
  async get_user_services(user: any) {
    const { email } = user
    let user_services = await this.servicePageManager.readAndWriteToArray(this._spm_db, email)
    if (user_services.length === 0) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return user_services
  }

  async getService(id: string) {
    try {
      //FIND AND RETURN SERVICE
      let service = await this.servicePageManager.findOneDocument(this._spm_db, "_id", id)
      if (service !== null ) return service

      // ID DOES NOT EXISTS OR ID IS NOT VALID ObjectId
      throw Error
    } catch (err: any) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.InvalidServiceId
      })
    }
  }
}