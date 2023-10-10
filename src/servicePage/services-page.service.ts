import { Injectable } from "@nestjs/common";
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
    let service = {email, services: [{
      service_name: service_name,
      description: description,
      links: [links],
      service_charge_in_person: service_charge_in_person,
      service_charge_virtual: service_charge_virtual,
      duration: duration,
      schedule_type: schedule_type,
      date: date
    }]}
    let isUserExists = await this.servicePageManager.read(this._spm, email)
    // console.log(service.services)
    if (isUserExists === null) {
      const new_service = await this.servicePageManager.create(this._spm, service)
      return new_service
    }
    console.log(service.services)
    return await this.servicePageManager.updateArr(this._spm, email, service.services)
  }
}