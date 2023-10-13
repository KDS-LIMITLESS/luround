import { BadRequestException, Injectable } from "@nestjs/common";
import ResponseMessages from "src/messageConstants";
import { DatabaseService } from "src/store/db.service";

@Injectable()
export class ServicePageManager {
  // _spm ---> Service Page Manager
  _spm = this.servicePageManager.serviceDB

  constructor(private servicePageManager: DatabaseService) {}

  async add_new_service(req: any){
    const {email, service_name, description, links, service_charge_virtual, service_charge_in_person,
      duration, schedule_type, date
    } = req

    let service:any = {email, services: [{
      service_name: service_name,
      description: description,
      links: links,
      service_charge_in_person: service_charge_in_person,
      service_charge_virtual: service_charge_virtual,
      duration: duration,
      schedule_type: schedule_type,
      date: date
    }]}

    let isUserExists = await this.servicePageManager.read(this._spm, email)
    if (isUserExists === null) {
      const new_service = await this.servicePageManager.create(this._spm, service)
      return new_service
    }
    return await this.servicePageManager.updateArr(this._spm, email, service.services)
  }

  async edit_service(req: any, query: any) {
    const { Qservice_name } = query
    const { 
      email, service_name, description, links, service_charge_virtual, 
      service_charge_in_person, duration, schedule_type, date
    } = req

    let service_update = await this.servicePageManager.updateService(this._spm, email, Qservice_name, 
      service_name, description, links, service_charge_virtual, 
      service_charge_in_person, duration, schedule_type, date 
    )   
    if (service_update.modifiedCount !== 1) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.SeviceNotFound
      })
    }
    return ResponseMessages.ServiceUpdated
  }
  // Add created_at and updated_at values
  // Add service link

  async delete_service(req: any) {
    const{ email, service_name } = req
    let deleted = await this.servicePageManager.deleteService(this._spm, email, service_name )
    if (deleted.modifiedCount !== 1) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.SeviceNotFound
      })
    }
    return ResponseMessages.ServiceDeleted
  }

  async get_user_services(req: any) {
    const { email } = req
    let user_services = await this.servicePageManager.read(this._spm, email)
    if (user_services === null) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return user_services
  }
}