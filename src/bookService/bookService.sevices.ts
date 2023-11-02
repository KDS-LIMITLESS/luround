import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "src/store/db.service";
import { ServicePageManager } from "src/servicePage/services-page.service";
import ResponseMessages from "src/messageConstants";

@Injectable()
export class BookingsManager {
  _bKM = this.bookingsManager.bookingsDB
  
  constructor(private bookingsManager: DatabaseService, private serviceManager: ServicePageManager ) {}
  
  // Decorate service with initialize payment 
  // Add the payment_reference to the bookingDetail document
  // Run seperate endpoint to verify the payment using the payment_reference_no.
  // If payment valid update booked status
  async book_service(bookingDetail: any, serviceID: string) {
  
    let serviceDetails = await this.serviceManager.getService(serviceID)
    if (serviceDetails) {
      let amount;
      if (bookingDetail.appointment_type === 'In-person' && serviceDetails.service_charge_in_person !== null) {
        amount = serviceDetails.service_charge_in_person
      } else if(bookingDetail.appointment_type === 'Virtual' && serviceDetails.service_charge_virtual !== null) {
        amount = serviceDetails.service_charge_virtual
      }
      bookingDetail = {
        service_id: serviceDetails._id,
        service_name: serviceDetails.service_name,
        service_provider_id: serviceDetails.service_provider_id,
        service_fee: amount,
        appointment_type: bookingDetail.appointment_type,
        service_receiver_names: bookingDetail.service_receiver_names,
        service_receiver_email: bookingDetail.service_receiver_email,
        phone_number: bookingDetail.phone_number,
        date: bookingDetail.date,
        time: bookingDetail.time,
        duration: bookingDetail.duration,
        message: bookingDetail.message || null,
        file: bookingDetail.file || null,
        payment_reference_number: null,
        booked_status: "PENDING CONFIRMATION",
        created_at: Date.now()
      }
      let service_booked = await this.bookingsManager.create(this._bKM, bookingDetail)
      // CHECK FOR PAYMENT CONFIRMED AND SEND NOTIFICATION
      if (service_booked.acknowledged) return {BookingId: service_booked.insertedId}
      throw Error("An error occurred")
    }
    throw new BadRequestException({
      message: "An error occurred"
    })
  }

  async get_booked_service_detail(booking_id: string) {
    let booking = await this.bookingsManager.findOneDocument(this._bKM, "_id", booking_id )
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
    let booking = await this.bookingsManager.readAndWriteToArray(this._bKM, 'service_provider_id', userId)
    if ( booking === null) {
      throw new NotFoundException({
        statusCode: 404,
        message: ResponseMessages.BOOKING_ID_NOT_FOUND
      })
    }
    return booking
  }
  // refund decorator 
  async cancel_booking(booking_id: string) {}

  async reschedule_booking(booking_id: string) {}

  async delete_booking(booking_id: string) {}
}