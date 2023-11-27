import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";
import { Encrypter } from "../utils/Encryption.js";
import { ServicePageDto } from "./servicePage.dto.js";


@Injectable()
export class ServicePageManager {
  // _spm_db ---> Service Page Manager_Database
  _spm_db = this.servicePageManager.serviceDB
  _udb = this.servicePageManager.userDB

  constructor(private servicePageManager: DatabaseService) {}

  async add_new_service(userId: string, serviceData: ServicePageDto){

    let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    let link = `https://luround.com/${encryption.encrypt(userId)}/${serviceData.service_name.replace(/\s/g, "_")}`     
    let service = {
      service_provider_id: userId, 
      service_name: serviceData.service_name,
      description: serviceData.description,
      links: serviceData.links,
      duration: serviceData.duration,
      service_charge_virtual: serviceData.service_charge_virtual || null,
      service_charge_in_person: serviceData.service_charge_in_person || null,
      schedule_type: serviceData.service_type,
      service_link: link,
      time: serviceData.time,
      date: serviceData.date,
      available_days: serviceData.available_days
    }
    try {
      const new_service = await this.servicePageManager.create(this._spm_db, service)
      return { serviceId: new_service.insertedId }
    } catch(err: any) {
      throw new InternalServerErrorException({
        message: "An error occured"
      })
    }
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
    const { userId } = user
    let user_services = await this.servicePageManager.readAndWriteToArray(this._spm_db, "service_provider_id", userId)
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
