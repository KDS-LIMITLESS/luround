import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import ResponseMessages from "../messageConstants.js";
import { DatabaseService } from "../store/db.service.js";
// import { Encrypter } from "../utils/Encryption.js";
import { ServiceDto, ServicePageDto } from "./servicePage.dto.js";
import { generateRandomAlphabets } from "../utils/mail.services.js";
import { InsightService } from "../insights/insights.service.js";


@Injectable()
export class ServicePageManager {
  // _spm_db ---> Service Page Manager_Database
  _spm_db = this.servicePageManager.serviceDB
  _udb = this.servicePageManager.userDB

  constructor(private servicePageManager: DatabaseService, private Insights: InsightService) {}

  async add_new_service(user: any, serviceData: ServicePageDto){
    const { userId, email, displayName } = user
    // let encryption = new Encrypter(process.env.ENCRYPTION_KEY as string)
    let randomLetters = await generateRandomAlphabets(6)
    let service_link = `https://luround.com/${serviceData.service_name.replace(/\s/g, "-")}/${randomLetters}`
    let service = {
      service_provider_details: { userId, email, displayName },
      service_link,
      service_type: serviceData.service_type,
      service_name: serviceData.service_name,
      description: serviceData.description,
      duration: serviceData.duration,
      pricing: serviceData.pricing,
      virtual_meeting_link: serviceData.virtual_meeting_link,
      availability_schedule: serviceData.availability_schedule,
      is_active: true,
      
      virtual_event_fee: serviceData.virtual_event_fee,
      in_person_event_fee: serviceData.in_person_event_fee,
      event_schedule: serviceData.event_schedule,
      start_date: serviceData.start_date || "not-allocated",
      end_date: serviceData.end_date || "not-allocated",
      service_recurrence: serviceData.service_recurrence,
      max_number_of_participants: serviceData.max_number_of_participants,
      notice_period: serviceData.notice_period || "",
      appointment_buffer: serviceData.appointment_buffer || "",
      booking_period: serviceData.booking_period || "",
      service_status: "ACTIVE",
      core_features: serviceData.core_features,
      physical_location: serviceData.physical_location || '',
      start_time: serviceData.start_time,
      end_time: serviceData.end_time,
      event_type: serviceData.event_type,
      stop_time: serviceData.stop_time,
      date: serviceData.date,
      service_fee: serviceData.service_fee,
      oneoff_type: serviceData.oneoff_type,
      price: serviceData.price
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

  async edit_service(user:any, serviceData: ServiceDto, serviceId: string) {
    const {userId, email, displayName } = user
    let _us
    let service = {
      service_provider_details: { userId, email, displayName },
      service_type: serviceData.service_type,
      service_name: serviceData.service_name,
      description: serviceData.description,
      duration: serviceData.duration,
      pricing: serviceData.pricing,
      virtual_meeting_link: serviceData.virtual_meeting_link,
      availability_schedule: serviceData.availability_schedule,
      is_active: true,
      
      virtual_event_fee: serviceData.virtual_event_fee,
      in_person_event_fee: serviceData.in_person_event_fee,
      event_schedule: serviceData.event_schedule,
      start_date: serviceData.start_date || "not-allocated",
      end_date: serviceData.end_date || "not-allocated",
      service_recurrence: serviceData.service_recurrence,
      max_number_of_participants: serviceData.max_number_of_participants,
      notice_period: serviceData.notice_period || "",
      appointment_buffer: serviceData.appointment_buffer || "",
      appointment_time: serviceData.appointment_time,
      booking_period: serviceData.booking_period || "",
      service_status: "ACTIVE",
      core_features: serviceData.core_features,
      physical_location: serviceData.physical_location || '',
      start_time: serviceData.start_time,
      end_time: serviceData.end_time,
      event_type: serviceData.event_type,
      stop_time: serviceData.stop_time,
      date: serviceData.date,
      service_fee: serviceData.service_fee,
      oneoff_type: serviceData.oneoff_type,
      price: serviceData.price
    
    }    

    try {
      // UPDATE DOCUMENT IN DATABASE IF FOUND.
      let user_services = await this.get_user_services_(userId)
    // FIND FOR A MATCH IN CURRENT USER'S SERVICES
    for (_us of user_services) {
      if (_us._id.toString() === serviceId) {
        await this.servicePageManager.updateDocument(this._spm_db, serviceId, service)
        return ResponseMessages.ServiceUpdated
      }
    }
    throw new NotFoundException({message: ResponseMessages.ServiceNotFound})
    } catch(err: any) {
      throw new BadRequestException({
        status: 404,
        message: err.message
      })
    }    
  }
  // Add created_at and updated_at values
  // Add service link

  async delete_service(userId: string,  serviceId: string) {
    let service;
    //GET CURRENT LOGGED IN USER'S SERVICES
    let user_services = await this.get_user_services_(userId)
    // FIND FOR A MATCH IN CURRENT USER'S SERVICES
    for (service of user_services) {
      if (service._id.toString() === serviceId) {
        return (await this.servicePageManager.delete( this._spm_db, serviceId )).value
      }
    }
    throw new NotFoundException({message: ResponseMessages.ServiceNotFound})
  }
  
  async get_user_services_(userId: string) {
    let filter_key = 'service_provider_details.userId'
    let user_services = await this.servicePageManager.readAndWriteToArray(this._spm_db, filter_key, userId)
    if (user_services.length === 0) {
      throw new BadRequestException({
        status: 400,
        message: ResponseMessages.EmailDoesNotExist
      })
    }
    return user_services
  }

  // This function queries and returns all user services where user equals userId
  async get_user_services(userId: string, service_type?: string) {
    let filter_key = 'service_provider_details.userId'
    let user_services = await this.servicePageManager.readAndWriteToArray(this._spm_db, filter_key, userId)
    if (user_services.length === 0) {
      return []
    }
    let services = []
    user_services.map((user_service) => {
      user_service.service_type === service_type ? services.push(user_service) : []
    })
    return services
  }

  async get_service_by_id(id: string) {
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

  async getService(url: string, service_type: string) {
    try {
      //FIND AND RETURN SERVICE
      let user_url = await this.servicePageManager.findOneDocument(this._udb, "luround_url",  url)
      if(user_url !== null) {
        let user_services = await this._spm_db.find({"service_provider_details.userId": user_url._id.toString()}).toArray()
        // let services = []

       return user_services.filter(user_service => 
        user_service.service_type === service_type && user_service.service_status !== 'SUSPENDED'
       ) 
      }
      throw new BadRequestException({message: "Invalid user Url"})
    } catch (err: any) {
      throw new BadRequestException({
        status: 400,
        message: err.message
      })
    }
  }

  async suspend_service(serviceId: string) {
    try {
      let find_service = await this.servicePageManager.findOneDocument(this._spm_db, "_id", serviceId)
      if (find_service === null) throw new BadRequestException({
        message: "Invalid Service Id"
      })

      if (find_service.service_status === 'ACTIVE') {
        find_service = await this.servicePageManager.updateDocument(this._spm_db, serviceId, {service_status: "SUSPENDED", is_active: false})
        return find_service
      }

      find_service = await this.servicePageManager.updateDocument(this._spm_db, serviceId, {service_status: "ACTIVE", is_active: true})
      return find_service
    } catch (err: any){
      throw new BadRequestException({message: err.message})
    }
    
  }

  async get_service_by_link(service_link: string) {
    try {
      let service = await this.servicePageManager.findOneDocument(this._spm_db, "service_link", service_link)
      if (service === null) {
        throw new BadRequestException({
          status: 400,
          message: "Service Not found"
        })
      }
      await this.Insights.record_service_link_clicks(service_link, service._id)
      return service
    } catch (err: any) {
      throw new BadRequestException({message: err.message})
    }
  }
    
    
}
