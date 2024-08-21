import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../store/db.service.js";
import { ServicePageManager } from "../servicePage/services-page.service.js";
import ResponseMessages from "../messageConstants.js";
import { BookServiceDto } from "./bookServiceDto.js";
import { TransactionsManger } from "../transaction/tansactions.service.js";
import { PaymentsAPI } from "../payments/paystack.sevices.js";
import { UserService } from "../user/user.service.js";
import { bookingConfirmed_account_viewer, bookingConfirmed_service_provider, bookingRescheduled, booking_account_viewer, convertToDateTime, scheduleEmailCronJob } from "../utils/mail.services.js";
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
  
  
  async book_service(bookingDetail: BookServiceDto, serviceID: string, user: any, invoice_id?:string, amount_paid?: string, transaction_ref?: string, due_date?: string, note?: string, booking_generated_from_invoice?: string, phone_number?: string) {
    try {
      if (bookingDetail.payment_reference === ''){
        throw new BadRequestException({message: 'Payment reference not found for this service booking'})
      }

      // CHECK IF SERVICE IS VALID AND EXISTS 
      let serviceDetails:any = await this.serviceManager.get_service_by_id(serviceID)
      
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
        document: bookingDetail.document,
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
          created_at: Date.now(),
          oneoff_type: serviceDetails.oneoff_type
        }
      }
      
      let service_booked = await this.databaseManager.create(this._bKM, booking_Detail)     
      if (service_booked.acknowledged) {
        if (bookingDetail.service_fee === "0") {

          // REGISTER BOOKING IN USER TRANSACTIONS LIST
          await this.transactionsManger.record_transaction(booking_Detail.service_provider_info.userId, {
            service_id: booking_Detail.service_details.service_id, service_name: booking_Detail.service_details.service_name, 
            service_fee: booking_Detail.service_details.service_fee, transaction_ref: booking_Detail.payment_reference_id, transaction_status: "RECEIVED", 
            affliate_user: booking_Detail.booking_user_info.displayName, customer_email: booking_Detail.booking_user_info.email
          })

          // UPDATE BOOKING PAYMENT STATUS
          await this.databaseManager.updateProperty(this._bKM, service_booked.insertedId.toString(), "booked_status", {booked_status: "CONFIRMED"})
          // STORE SERVICE INSIGHTS
          let dt = new Date()
          await this.serviceInsights.store_service_booking_history(
            serviceDetails._id,
            serviceDetails.service_name, 
            bookingDetail.service_fee, 
            `${dt.getDate()}/${dt.getMonth()}/${dt.getFullYear()}`, 
            bookingDetail.displayName 
          )
          
          // SCHEDULE EMAIL CRON JOBS
          await scheduleEmailCronJob(booking_Detail.service_details.date, booking_Detail)
        
          // ADD USER TO SERVICE PROVIDER CONTACTS
          let service_provider_id = new ObjectId(serviceDetails.service_provider_details.userId)
          await this.crmService.add_new_contact(service_provider_id, 
            {
              name: booking_Detail.booking_user_info.displayName,
              email: booking_Detail.booking_user_info.email,
              phone_number: booking_Detail.booking_user_info.phone_number
            })

          // SEND EMAILS
          await booking_account_viewer(booking_Detail.booking_user_info.email, booking_Detail).catch((err: any) => {
            console.log(err.err.error.details)
          })

          await bookingConfirmed_service_provider(booking_Detail.service_provider_info.email, booking_Detail).catch((err: any) => {
            console.log(err.err.error.details)
          })
          
        } 
        let user_nToken = await this.userService.get_user_notification_token(serviceDetails.service_provider_details.userId)
        return {
           userId: serviceDetails.service_provider_details.userId,
           user_nToken, 
           BookingId: service_booked.insertedId, 
           transaction_ref: booking_Detail.payment_reference_id
           // booking_payment_link: response.data.link
        }  

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
        
      }
      throw new BadRequestException({message: "An error occured. Service not booked"})
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

      let dt = new Date()
      await this.serviceInsights.store_service_booking_history(
        get_booking.service_details.service_id.toString(),
        get_booking.service_details.service_name, 
        get_booking.service_details.service_fee, 
        `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`, 
        get_booking.booking_user_info.displayName 
      )

      // UPDATE BOOKING PAYMENT STATUS
      await this.databaseManager.updateProperty(this._bKM, booking_id, "booked_status", {booked_status: "CONFIRMED"})

      await scheduleEmailCronJob(get_booking.service_details.date, get_booking)

      // ADD USER TO SERVICE PROVIDER CONTACTS
      let service_provider_id = new ObjectId(get_booking.service_provider_info.userId)
      await this.crmService.add_new_contact(service_provider_id, 
        {
          name: get_booking.booking_user_info.displayName,
          email: get_booking.booking_user_info.email,
          phone_number: get_booking.booking_user_info.phone_number
        })

        // THE BOOKING ALREADY EXISTS. SO CONFIRM THE BOOKING BEFORE PROCEDDING WITH SENDING EMAILS.
        await this.transactionsManger.record_transaction(get_booking.service_provider_info.userId, {
          service_id: get_booking.service_details.service_id, service_name: get_booking.service_details.service_name, 
          service_fee: get_booking.service_details.service_fee, transaction_ref: get_booking.payment_reference_id, transaction_status: "RECEIVED", 
          affliate_user: get_booking.booking_user_info.displayName, customer_email: get_booking.booking_user_info.email
        })

        // send email to account viewer
        await booking_account_viewer(get_booking.booking_user_info.email, get_booking).catch((err: any) => {
          console.log(err.err.error.details)
        })

        // await bookingConfirmed_account_viewer(get_booking.booking_user_info.email, get_booking)
        await bookingConfirmed_service_provider(get_booking.service_provider_info.email, get_booking)
        // EVEN IF EMAIL IS NOT VALID, PROCEED WITH UPDATING THE BOOKING STATUS IN DB
        .catch(async (err) => {
          console.log(err.err.error.details)
        })
      } 
    } catch(err: any){
      console.log(err)
      throw new BadRequestException({message: err.message})
    }
  }

  async confirm_booking_with_invoice_id(invoice_id: string) {
    try {
      let get_booking = await this.databaseManager.findOneDocument(this._bKM, "invoice_id", invoice_id)

      if (get_booking !== null ) {

        let dt = new Date()
      await this.serviceInsights.store_service_booking_history(
        get_booking.service_details.service_id.toString(),
        get_booking.service_details.service_name, 
        get_booking.service_details.service_fee, 
        `${dt.getDate()}/${dt.getMonth()}/${dt.getFullYear()}`, 
        get_booking.booking_user_info.displayName 
      )

      // UPDATE BOOKING PAYMENT STATUS
      await this.databaseManager.updateProperty(this._bKM, get_booking._id, "booked_status", {booked_status: "CONFIRMED"})

      await scheduleEmailCronJob(get_booking.service_details.date, get_booking)

      // ADD USER TO SERVICE PROVIDER CONTACTS
      let service_provider_id = new ObjectId(get_booking.service_provider_info.userId)
      await this.crmService.add_new_contact(service_provider_id, 
        {
          name: get_booking.booking_user_info.displayName,
          email: get_booking.booking_user_info.email,
          phone_number: get_booking.booking_user_info.phone_number
        })

        // THE BOOKING ALREADY EXISTS. SO CONFIRM THE BOOKING BEFORE PROCEDDING WITH SENDING EMAILS.
        await this.transactionsManger.record_transaction(get_booking.service_provider_info.userId, {
          service_id: get_booking.service_details.service_id, service_name: get_booking.service_details.service_name, 
          service_fee: get_booking.service_details.service_fee, transaction_ref: get_booking.payment_reference_id, transaction_status: "RECEIVED", 
          affliate_user: get_booking.booking_user_info.displayName, customer_email: get_booking.booking_user_info.email
        })
       
        await bookingConfirmed_service_provider(get_booking.service_provider_info.email, get_booking)
        .catch(async (err) => {
          console.log(err.err.error.details)
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
      const filter1 = { 'service_provider_info.userId': userId, 'booked_status': 'CONFIRMED' }; // Services provided by the user
      const filter2 = { 'booking_user_info.userId': userId, 'booked_status': 'CONFIRMED' }; // Services booked by the user

    // Fetch both sets of bookings in parallel
    const [booked_me, i_booked] = await Promise.all([
      this._bKM.find(filter1).toArray(),
      this._bKM.find(filter2).toArray()
    ]);
      //  1st OBJECT --> BOOKINGS I MADE TO OTHER USERS
      //  2nd OBJECT -->  BOOKINGS I MADE TO OTHER USERS 
      booked_me.sort((a, b) => b.service_details.created_at - a.service_details.created_at);
      i_booked.sort((a, b) => b.service_details.created_at - a.service_details.created_at);

      return [{userBooked: false, details: booked_me}, {userBooked: true, details: i_booked}]
    } catch (err: any){
      throw new NotFoundException({message: "Bookings not found"})
    }
  }
  
  async get_all_confirmed_bookings() {
    const filter = { 'booked_status': 'CONFIRMED' }
    const CONFIRMED_BOOKINGS = await this._bKM.find(filter).toArray()
    return CONFIRMED_BOOKINGS.length
  }

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

  async registerBookingSchedule(serviceName: string, date: any, time: string) {
    try { 
      const bookingSchedule = await this.databaseManager.findOneDocument(this._sdl, "service_name", serviceName);
  
      const newData = {
        selected_time: time,
        selected_date: date
      };
  
      if (!bookingSchedule) {
        const newSchedule = {
          service_name: serviceName,
          schedules: [newData]
        };
        return await this.databaseManager.create(this._sdl, newSchedule);
      }
      // CHECK SCHEDULE DATE AND REMOVE FROM DB
      await this.clear_service_schedule(bookingSchedule._id, bookingSchedule)
      
      // CHECK IF SCHEDULE ALREADY TAKEN
      const scheduleExists = bookingSchedule.schedules.some((schedule: any) =>
        schedule.selected_time === time && schedule.selected_date === date
      );
      
      if (!scheduleExists) {
        return await this.databaseManager.updateArr(this._sdl, "service_name", serviceName, "schedules", [newData]);
      }
      
      throw new BadRequestException({ message: "Booking data taken" });
    } catch (err: any) {
      throw new BadRequestException({ message: err.message });
    }
  }

  async clear_service_schedule(_id: string, schedule:any) {
    let currentDate = new Date()
    
    let outdatedSchedule = []
    schedule.schedules.filter((elem: any) => {
      let time = convertToDateTime(elem.selected_time)
      let scheduleDate = new Date(`${elem.selected_date} ${time.split(" ")[4]}`) 
      scheduleDate > currentDate ? true : outdatedSchedule.push(elem)
      return scheduleDate > currentDate
    })
    for (const elem of outdatedSchedule){
      await this.databaseManager.deletefromArray(this._sdl, _id, "schedules", elem )
    }
  }
}