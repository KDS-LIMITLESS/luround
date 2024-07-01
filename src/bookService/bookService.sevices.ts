import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import ResponseMessages from "../messageConstants.js";
import { BookServiceDto } from "./bookServiceDto.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { UserService } from "../user/user.service.js";
import { bookingConfirmed_account_viewer, bookingConfirmed_service_provider, bookingRescheduled, booking_account_viewer, scheduleEmailCronJob } from "../utils/mail.services.js";
import { CRMService } from "../crm/crm.service.js";
import { ObjectId } from "mongodb";
import { InsightService } from "../insights/insights.service.js";

@Injectable()
export class BookingsManager {
  _bKM = this.databaseManager.bookingsDB
  _sdl = this.databaseManager.scheduleDB
  
  constructor(
    private databaseManager: DatabaseService, 
    private serviceManager: ServicePageManager,
    private transactionsManger: TransactionsManger,
    private paymentsManager: PaymentsAPI,
    private userService: UserService,
    private crmService: CRMService,
    private serviceInsights: InsightService
  ) {}
  
  // Decorate service with initialize payment 
  // Add the payment_reference to the bookingDetail document
  // Run seperate endpoint to verify the payment using the payment_reference_no.
  // If payment valid update booked status

  // Increase price based on the service duration
  async book_service(bookingDetail: BookServiceDto, serviceID: string, user: any, invoice_id?:string, amount_paid?: string, transaction_ref?: string, due_date?: string, note?: string, booking_generated_from_invoice?: string, phone_number?: string) {
    try {
      if (bookingDetail.payment_reference === ''){
        throw new BadRequestException({message: 'Please ensure you complete the payment for this service.'})
      }
      // GET UNIQUE TRANSACTION REFERENCE CODE
      let tx_ref = await this.paymentsManager.generateUniqueTransactionCode("BOOKING")

      // const { userId, email, displayName } = user
      // CHECK IF SERVICE IS VALID AND EXISTS 
      let serviceDetails:any = await this.serviceManager.get_service_by_id(serviceID)
      // CHECK IF USER IS TRYING TO BOOK THEMSELVES
      // if (serviceDetails && serviceDetails.service_provider_details.userId !== userId) {
      let amount: string;
      if (bookingDetail.appointment_type === 'In-Person') {
        amount = serviceDetails.service_charge_in_person
      } else if (bookingDetail.appointment_type === 'Virtual') {
        amount = serviceDetails.service_charge_virtual
      }

      let booking_Detail = {
        service_provider_info: serviceDetails.service_provider_details,
        // booking_user_info: {userId, email, displayName, phone_number: bookingDetail.phone_number },
        booking_user_info: {
          // userId: "" || user.userId,
          email: bookingDetail.email,
          displayName: bookingDetail.displayName, 
          phone_number: bookingDetail.phone_number || phone_number
        },
        booked_status: "PENDING CONFIRMATION",
        payment_reference_id: transaction_ref || bookingDetail.payment_reference,
        invoice_id: invoice_id || "",
        booking_generated_from_invoice: booking_generated_from_invoice || "False",
        start_time: bookingDetail.start_time || serviceDetails.start_time,
        end_time: bookingDetail.end_time || serviceDetails.end_time,
        service_details: {
          service_id: serviceDetails._id,
          service_name: serviceDetails.service_name,
          service_fee: bookingDetail.service_fee || amount_paid,
          service_type: bookingDetail.service_type || serviceDetails.service_type,
          appointment_type: bookingDetail.appointment_type,
          date: due_date || bookingDetail.date,
          time: bookingDetail.time,
          duration: bookingDetail.duration,
          message: note || bookingDetail.message || null,
          location: bookingDetail.location,
          created_at: Date.now()
        }
      }
      
      let service_booked = await this.databaseManager.create(this._bKM, booking_Detail)
      await scheduleEmailCronJob(booking_Detail.service_details.date, booking_Detail)

      // ADD USER TO SERVICE PROVIDER CONTACTS
      let service_provider_id = new ObjectId(serviceDetails.service_provider_details.userId)
      await this.crmService.add_new_contact(service_provider_id, 
        {
          name: booking_Detail.booking_user_info.displayName,
          email: booking_Detail.booking_user_info.email,
          phone_number: booking_Detail.booking_user_info.phone_number
        })
        
      // CHECK FOR PAYMENT CONFIRMED AND SEND NOTIFICATION
      if (service_booked.acknowledged) {
        // SEND EMAILS
        await booking_account_viewer(booking_Detail.booking_user_info.email, booking_Detail)
        // await bookingConfirmed_service_provider(booking_Detail.service_provider_info.email, booking_Detail)
        // *********INITIATE AND RECORD PAYMENT *************
        // let response: any = await PaymentsAPI.initiate_flw_payment(amount, user, bookingDetail.phone_number, tx_ref, 
        //   {
        //     service_name: serviceDetails.service_name, 
        //     payment_receiver: serviceDetails.service_provider_details.displayName,
        //     payment_receiver_id: serviceDetails.service_provider_details.userId
        //   }
        // )
        // ******** RECORD TRANSACTION *********
        // CURRENT LOGGED IN USER TRANSACTION DETAIL
        // this.transactionsManger.record_transaction(userId, {
        //   service_id: serviceDetails._id, service_name: serviceDetails.service_name, 
        //   service_fee: amount, transaction_ref: tx_ref, transaction_status: "SENT", 
        //   affliate_user: serviceDetails.service_provider_details.displayName
        // })
        // SERVICE PROVIDER TRANSACTION DETAIL
        // GET SERVICE PROVIDER DEVICE NOTIFICATION TOKEN 
        let user_nToken = await this.userService.get_user_notification_token(serviceDetails.service_provider_details.userId)
        return {
          userId: serviceDetails.service_provider_details.userId,
          user_nToken, 
          BookingId: service_booked.insertedId, 
          transaction_ref: booking_Detail.payment_reference_id
          // booking_payment_link: response.data.link
        }
      }
      throw new BadRequestException({message: "An error occured. Service not booked"})
      // }
      // throw new BadRequestException({
      //   message: "An error occurred. Are you booking Yourself?"
      // })
    } catch (err: any) {
      console.log(err)
      throw new BadRequestException({message: "An error occured while booking", err})
    }
   
  }

  /**
   * Booking confirmation for an account owner
   * @param booking_id - Id of the booking to be confirmed
   */
  async confirm_booking(booking_id: string) {
    try {
      
      let get_booking = await this.databaseManager.findOneDocument(this._bKM, "_id", booking_id)
      if (get_booking !== null) {
        // THE BOOKING ALREADY EXISTS. SO CONFIRM THE BOOKING BEFORE PROCEDDING WITH SENDING EMAILS.
        await this.transactionsManger.record_transaction(get_booking.service_provider_info.userId, {
          service_id: get_booking.service_details.service_id, service_name: get_booking.service_details.service_name, 
          service_fee: get_booking.service_details.service_fee, transaction_ref: get_booking.payment_reference_id, transaction_status: "RECEIVED", 
          affliate_user: get_booking.booking_user_info.displayName, customer_email: get_booking.booking_user_info.email
        })
        // REGISTER SERVICE INSIGHTS.
        await this.serviceInsights.store_service_booking_history(
          get_booking.service_details.service_id,
          get_booking.service_details.service_name, 
          get_booking.service_details.service_fee, 
          get_booking.service_details.created_at, 
          get_booking.booking_user_info.displayName 
        )
        // await bookingConfirmed_account_viewer(get_booking.booking_user_info.email, get_booking)
        await bookingConfirmed_service_provider(get_booking.service_provider_info.email, get_booking)
        // supress bounced emails
        .then(async () => {
          return await this.databaseManager.updateProperty(this._bKM, booking_id, "booked_status", {booked_status: "CONFIRMED"})
        })
        // EVEN IF EMAIL IS NOT VALID, PROCEED WITH UPDATING THE BOOKING STATUS IN DB
        .catch(async () => {
          return await this.databaseManager.updateProperty(this._bKM, booking_id, "booked_status", {booked_status: "CONFIRMED"})
        })
      } 
    } catch(err: any){
      throw new BadRequestException({message: err.message})
    }
  }

  async confirm_booking_with_invoice_id(invoice_id: string) {

    console.log(invoice_id)
    try {
      let get_booking = await this.databaseManager.findOneDocument(this._bKM, "invoice_id", invoice_id)
      console.log(get_booking)

      if (get_booking !== null ) {
        await this.serviceInsights.store_service_booking_history(
          get_booking.service_details.service_id,
          get_booking.service_details.service_name, 
          get_booking.service_details.service_fee, 
          get_booking.service_details.created_at, 
          get_booking.booking_user_info.displayName 
        )
        await bookingConfirmed_service_provider(get_booking.booking_user_info.email, get_booking)
        // supress bounced emails
        .then(async () => {
          return await this.databaseManager.updateProperty(this._bKM, get_booking._id, "booked_status", {booked_status: "CONFIRMED"})
        })
        .catch(async () => {
          return await this.databaseManager.updateProperty(this._bKM, get_booking._id, "booked_status", {booked_status: "CONFIRMED"})
        })
      }
    } catch(err: any){
      throw new BadRequestException({message: "Booking not updated"})
    }
  }

  async get_booked_service_detail(booking_id: string) {
    let booking:any = await this.databaseManager.findOneDocument(this._bKM, "_id", booking_id )
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
      let filter1 = 'service_provider_info.userId' // The service provider being booked
      let filter2 = 'booking_user_info.userId' // The user booking the service
      // BOOKED ME = MY SERVICES THAT CUSTOMERS BOOKED
      // i BOOKED = SERVICES THAT I BOOKED FROM OTHER USERS
      let [booked_me, i_booked] = await Promise.all([
        await this.databaseManager.readAndWriteToArray(this._bKM, filter1, userId), 
        await this.databaseManager.readAndWriteToArray(this._bKM, filter2, userId)
      ])
      //  1st OBJECT --> BOOKINGS I MADE TO OTHER USERS
      //  2nd OBJECT -->  BOOKINGS I MADE TO OTHER USERS 
        return [{userBooked: false, details: booked_me}, {userBooked: true, details: i_booked}]
    } catch (err: any){
      throw new NotFoundException({message: "Bookings not found"})
    }
  }
  // refund decorator 
  
  // how do we diffarentiate a booking that has been carried out and one that hasnt
  async cancel_booking(booking_id: string) {
    let booking = await this.databaseManager.findOneDocument(this._bKM, "_id", booking_id)
    if (booking) {
      return await this.databaseManager.updateProperty(this._bKM, booking_id, "booked_status", {booked_status: "CANCELLED"})
    }
    throw new NotFoundException({message: "Booking Not Found"})
  }

  async reschedule_booking(booking_id: string, new_date: string, new_time: string, duration: string, start_time: string, end_time: string) {
    let schedule_details = {"service_details.date": new_date, "service_details.time": new_time, "service_details.duration": duration, "end_time": end_time, "start_time": start_time}
    let update;
    Object.keys(schedule_details).forEach(async (key) => {
      update = await this.databaseManager.updateProperty(this._bKM, booking_id, key, schedule_details)
    })
    let get_booking = await this.databaseManager.findOneDocument(this._bKM, "_id", booking_id )
    await bookingRescheduled(get_booking.booking_user_info.email, get_booking )
    return 'Booking schedule updated'
  }

  async delete_booking(booking_id: string) {
    let booking = await this.databaseManager.delete(this._bKM, booking_id)
    if (booking.value !== null) return `Booking deleted!` 
    throw new BadRequestException({
      message: ResponseMessages.BOOKING_ID_NOT_FOUND
    })
  }

  async register_booking_schedule(service_name: string, date: any, time: string) {
    try { 
      let booking_schedule = await this.databaseManager.findOneDocument(this._sdl, "service_name", service_name)
      let schedule = {
        selected_time: time,
        selected_date: date.service_details.date
      }
      if(booking_schedule === null) {

        return await this.databaseManager.create(this._sdl, {"service_name": service_name, schedules: [schedule]})
      }
      let schedules = booking_schedule.schedules.filter((obj: any) => {
        obj.selected_time === time && obj.selected_date === date
      })
      if (schedules.length === 0 ) {
       return await this.databaseManager.updateArr(this._sdl, "service_name", service_name, "schedule", [schedule])
      }
      throw new BadRequestException({message: "Booking schedule taken"})
    }
    catch (err: any){
      throw new BadRequestException({message: err.message})
    }
  } 
}