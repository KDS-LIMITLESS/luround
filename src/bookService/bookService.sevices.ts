import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import ResponseMessages from "../messageConstants.js";
import { BookServiceDto } from "./bookServiceDto.js";

@Injectable()
export class BookingsManager {
  _bKM = this.bookingsManager.bookingsDB
  
  constructor(private bookingsManager: DatabaseService, private serviceManager: ServicePageManager ) {}
  
  // Decorate service with initialize payment 
  // Add the payment_reference to the bookingDetail document
  // Run seperate endpoint to verify the payment using the payment_reference_no.
  // If payment valid update booked status

  // Increase price based on the service duration
  async book_service(bookingDetail: BookServiceDto, serviceID: string, user: any) {
    
    const { userId, email, displayName } = user
    let serviceDetails:any = await this.serviceManager.getService(serviceID)
    if (serviceDetails) {
      let amount: string;
      if (bookingDetail.appointment_type === 'In-person' ) {
        amount = serviceDetails.service_charge_in_person
      } else if (bookingDetail.appointment_type === 'Virtual') {
        amount = serviceDetails.service_charge_virtual
      }
      let booking_Detail = {
        service_provider_info: serviceDetails.service_provider_details,
        booking_user_info: {userId, email, displayName, phone_number: bookingDetail.phone_number },
        service_details: {
          service_id: serviceDetails._id,
          service_name: serviceDetails.service_name,
          service_fee: amount,
          appointment_type: bookingDetail.appointment_type,
          date: bookingDetail.date,
          time: bookingDetail.time,
          duration: bookingDetail.duration,
          message: bookingDetail.message || null,
          file: bookingDetail.file || null,
          location: bookingDetail.location,
          // payment_reference_id: bookingDetail.payment_reference_id,
          booked_status: "PENDING CONFIRMATION",
          created_at: Date.now()
        }
      }
      let service_booked = await this.bookingsManager.create(this._bKM, booking_Detail)
      // CHECK FOR PAYMENT CONFIRMED AND SEND NOTIFICATION
      if (service_booked.acknowledged) return {BookingId: service_booked.insertedId}
      throw Error("An error occurred")
    }
    throw new BadRequestException({
      message: "An error occurred"
    })
  }

  async get_booked_service_detail(booking_id: string) {
    let booking:any = await this.bookingsManager.findOneDocument(this._bKM, "_id", booking_id )
    if ( booking === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: ResponseMessages.BOOKING_ID_NOT_FOUND
      })
    }
    const {booked_status, service_price, service_id, ...booking_details} = booking
    return booking_details
  }

  // RUN THIS FUNCTION IN THE WORKER THREAD AND CACHE THE RESPONSE
  async get_user_service_bookings(userId: string) {
    try {
      let filter1 = 'service_provider_info.userId'
      let filter2 = 'booking_user_info.userId'
      let [booked_me, i_booked] = await Promise.all([
        await this.bookingsManager.readAndWriteToArray(this._bKM, filter1, userId), 
        await this.bookingsManager.readAndWriteToArray(this._bKM, filter2, userId)
      ])
        return [{userBooked: false, details: booked_me}, {userBooked: true, details: i_booked}]
    } catch (err: any){
      throw new NotFoundException({message: "Bookings not found"})
    }
  }
  // refund decorator 
  
  // how do we diffarentiate a booking that has been carried out and one that hasnt
  async cancel_booking(booking_id: string) {}

  async reschedule_booking(booking_id: string, new_date: string, new_time: string) {
    let schedule_details = {date: new_date, time: new_time}
    let update;
    Object.keys(schedule_details).forEach(async (key) => {
      update = await this.bookingsManager.updateProperty(this._bKM, booking_id, key, schedule_details)
    })
    return 'Booking schedule updated'
  }

  async delete_booking(booking_id: string) {
    let booking = await this.bookingsManager.delete(this._bKM, booking_id)
    if (booking.value !== null) return `Booking deleted!` 
    throw new BadRequestException({
      message: ResponseMessages.BOOKING_ID_NOT_FOUND
    })
  }
}