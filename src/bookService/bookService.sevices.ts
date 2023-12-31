import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import ResponseMessages from "../messageConstants.js";
import { BookServiceDto } from "./bookServiceDto.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { UserService } from "../user/user.service.js";

@Injectable()
export class BookingsManager {
  _bKM = this.bookingsManager.bookingsDB
  
  constructor(
    private bookingsManager: DatabaseService, 
    private serviceManager: ServicePageManager,
    private transactionsManger: TransactionsManger,
    private paymentsManager: PaymentsAPI,
    private userService: UserService
  ) {}
  
  // Decorate service with initialize payment 
  // Add the payment_reference to the bookingDetail document
  // Run seperate endpoint to verify the payment using the payment_reference_no.
  // If payment valid update booked status

  // Increase price based on the service duration
  async book_service(bookingDetail: BookServiceDto, serviceID: string, user: any) {
    // GET UNIQUE TRANSACTION REFERENCE CODE
    let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("LUROUND")
    const { userId, email, displayName } = user
    // CHECK IF SERVICE IS VALID AND EXISTS 
    let serviceDetails:any = await this.serviceManager.getService(serviceID)
    // CHECK IF USER IS TRYING TO BOOK THEMSELVES
    if (serviceDetails && serviceDetails.service_provider_details.userId !== userId) {
      let amount: string;
      if (bookingDetail.appointment_type === 'In-Person' ) {
        amount = serviceDetails.service_charge_in_person
      } else if (bookingDetail.appointment_type === 'Virtual') {
        amount = serviceDetails.service_charge_virtual
      }
      let booking_Detail = {
        service_provider_info: serviceDetails.service_provider_details,
        booking_user_info: {userId, email, displayName, phone_number: bookingDetail.phone_number },
        booked_status: "PENDING CONFIRMATION",
        payment_reference_id: tx_ref,
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
          created_at: Date.now()
        }
      }
      let service_booked = await this.bookingsManager.create(this._bKM, booking_Detail)
      
      // CHECK FOR PAYMENT CONFIRMED AND SEND NOTIFICATION
      if (service_booked.acknowledged) {
        // *********INITIATE AND RECORD PAYMENT *************
        let response: any = await PaymentsAPI.initiate_flw_payment(amount, user, bookingDetail.phone_number, tx_ref, 
          {
            service_name: serviceDetails.service_name, 
            payment_receiver: serviceDetails.service_provider_details.displayName,
            payment_receiver_id: serviceDetails.service_provider_details.userId
          }
        )
        // ******** RECORD TRANSACTION *********

        // CURRENT LOGGED IN USER TRANSACTION DETAIL
        this.transactionsManger.record_transaction(userId, {
          service_id: serviceDetails._id, service_name: serviceDetails.service_name, 
          service_fee: amount, transaction_ref: tx_ref, transaction_status: "SENT", 
          affliate_user: serviceDetails.service_provider_details.displayName
        })

        // SERVICE PROVIDER TRANSACTION DETAIL
        this.transactionsManger.record_transaction(serviceDetails.service_provider_details.userId, {
          service_id: serviceDetails._id, service_name: serviceDetails.service_name, 
          service_fee: amount, transaction_ref: tx_ref, transaction_status: "RECEIVED", 
          affliate_user: displayName
        })
        // GET SERVICE PROVIDER DEVICE NOTIFICATION TOKEN 
        let user_nToken = await this.userService.get_user_notification_token(serviceDetails.service_provider_details.userId)
        return {
          nUserId: serviceDetails.service_provider_details.userId,
          user_nToken, 
          BookingId: service_booked.insertedId, 
          booking_payment_link: response.data.link
        }
      } 
      throw new InternalServerErrorException({message: "An error occured. Service not booked"})
    }
    throw new BadRequestException({
      message: "An error occurred. Are you booking Yourself?"
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
    // The booked_me variable contains only services with bookigs status set to successful.
    try {
      let filter1 = 'service_provider_info.userId' // The service provider being booked
      let filter2 = 'booking_user_info.userId' // The user booking the service
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
    let schedule_details = {"service_details.date": new_date, "service_details.time": new_time}
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