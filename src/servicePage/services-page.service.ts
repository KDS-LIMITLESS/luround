import { BadRequestException, Injectable } from "@nestjs/common";
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";

@Injectable()
export class ServicePageManager {
  // _spm_db ---> Service Page Manager_Database
  _spm_db = this.servicePageManager.serviceDB
  _udb = this.servicePageManager.userDB

  constructor(private servicePageManager: DatabaseService) {}

  async add_new_service(req: any){
    const {email, service_name, description, links, service_charge_virtual, service_charge_in_person,
      duration, schedule_type, date
    } = req

    // DEFINE THE SERVICE STRUCTURE TO STORE TO DATABASE
    let service: any = {email, service_name, description,links: links, 
      service_charge_in_person, service_charge_virtual, duration,
      schedule_type, date
    }

    let isUserExists = await this.servicePageManager.read(this._udb, email)
    if (isUserExists === null) {
      throw new BadRequestException({
        status:400, message: ResponseMessages.EmailDoesNotExist
      })  
    }
    const new_service = await this.servicePageManager.create(this._spm_db, service)
    return new_service
    // return await this.servicePageManager.updateArr(this._spm_db, email, service.services)
  }

  async edit_service(req: any, query: any) {
    const { id } = query
    const { 
      service_name, description, links, service_charge_virtual, 
      service_charge_in_person, duration, schedule_type, date
    } = req
    
    // DEFINE THE SERVICE STRUCTURE TO STORE TO DATABASE
    let service: any = {service_name, description,links: links, 
      service_charge_in_person, service_charge_virtual, duration,
      schedule_type, date
    }

    try {
      // UPDATE DOCUMENT IN DATABASE IF FOUND.
      if ((await this.servicePageManager.updateDocument(this._spm_db, id, service)).matchedCount === 1)   
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

  async delete_service(req: any) {
    const{ email, service_name } = req
    let deleted = await this.servicePageManager.deleteService(this._spm_db, email, service_name )
    if (deleted.modifiedCount !== 1) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.ServiceNotFound
      })
    }
    return ResponseMessages.ServiceDeleted
  }

  // This function queries and returns all user services where email equals user email
  async get_user_services(req: any) {
    const { email } = req
    let user_services = await this.servicePageManager.readAndWriteToArray(this._spm_db, email)
    if (user_services.length === 0) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return user_services
  }

  async getService(req: any) {
    const { id } = req
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