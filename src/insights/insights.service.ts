import { BadRequestException, Injectable } from "@nestjs/common";
import { ObjectId } from "mongodb";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import { DatabaseService } from "../store/db.service.js";


@Injectable()
export class InsightService {

  _insightsDB = this.DatabaseService.insightDB
  _SPM = this.DatabaseService.serviceDB
  constructor(private DatabaseService: DatabaseService, private serviceManager:ServicePageManager) {}

  // STORE INSIGHTS OF EACH AND EVERY SERVICE CREATED.
  async store_service_booking_history(service_id: string, service_name: string, 
    service_amount: string, date_booked: string, customer_name: string) 
  {
    // FIND THE SERVICE WITH SPECIFIED ID 
    let find_service_id = await this.DatabaseService.findOneDocument(this._insightsDB, "_id", service_id)
    let bookings = {service_name, date_booked, customer_name, service_amount}
    if (find_service_id === null) {
      return await this.DatabaseService.create(this._insightsDB, {"_id": new ObjectId(service_id), bookings: [bookings]})
    }
    return await this.DatabaseService.updateArr(this._insightsDB, "_id", new ObjectId(service_id), "bookings", [bookings])
    
  }

  // RETURN THE BOOKINGS MADE FOR A PARTICULAR SERVICE
  async get_service_insight(service_id: string) {
    const serviceId = new ObjectId(service_id);
    
    const serviceInsights = await this._insightsDB.find({ "_id": serviceId }).toArray();

    let totalBookingCount = 0;
    let serviceBookings = [];

    serviceInsights.forEach((insight) => {
        serviceBookings.push(...insight.bookings);  // flatten bookings array wit spread
        totalBookingCount += insight.bookings.length;
    });

    // Return booking count and bookings as separate objects in a tuple
    return [
       { booking_count: totalBookingCount }, 
       { bookings: serviceBookings }
    ];
  }

  async record_service_link_clicks(shortURL: string) {
    // FIND THE SERVICE WITH SPECIFIED SHORTURL
    let findService = await this.DatabaseService.findOneDocument(this._SPM, "service_link.shortURL", shortURL)
      
    if (findService !== null) {
      // CHECK IF SERVICES HAS AN INSIGHTS DOCUMENT ON DB AND UPDATE
      let getServiceInsigts = await this.DatabaseService.findOneDocument(this._insightsDB, "_id", findService._id.toString())
      if (getServiceInsigts !== null) {
        await this.DatabaseService.updateDocument(this._insightsDB, findService._id, {clicks: getServiceInsigts.clicks += 1})
        return findService.service_link.longURL
      }
      // ELSE CREATE A NEW INSIGHTS DOCUMENT FOR THE SERVICE
      await this.DatabaseService.create(this._insightsDB, {"_id": new ObjectId(findService._id.toString()), clicks: 1})
      return findService.service_link.longURL  // RETURN THE LONG URL OF THE SERVICE
    }
    throw new BadRequestException({message: "Bad or broken link"})
  }

}