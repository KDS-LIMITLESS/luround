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
    console.log(service.services[0].links)
    return await this.servicePageManager.updateArr(this._spm, email, service.services)
  }

  async edit_service(req: any, query: any) {
    const { Qservice_name } = query
    const { 
      email, service_name, description, links, service_charge_virtual, 
      service_charge_in_person, duration, schedule_type, date
    } = req

    let service_update = await this.servicePageManager.updateServices(this._spm, email, Qservice_name, 
      service_name, description, links, service_charge_virtual, 
      service_charge_in_person, duration, schedule_type, date 
    )   
    if (service_update === 0) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.SeviceNotFound
      })
    }
    return service_update
  }
}