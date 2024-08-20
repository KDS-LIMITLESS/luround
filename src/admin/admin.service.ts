import { Injectable } from "@nestjs/common";
import { BookingsManager } from "../bookService/bookService.sevices.js";
import { DatabaseService } from "../store/db.service.js";
import { UserService } from "../user/user.service.js";


@Injectable()
export class AdminService {
  _udb = this.databaseManager.userDB
  _bkdb = this.databaseManager.bookingsDB

  constructor(
    private databaseManager: DatabaseService, 
    private bookingsService: BookingsManager,
    private userService: UserService) 
  {}

  async computeAdminAnalytics() {
    const date = Date.now();
    const [total_users, total_bookings] = await Promise.all([
      this._udb.countDocuments(), 
      this.bookingsService.get_all_confirmed_bookings()
    ]);
    
    const get_users = await this._udb.find({}).toArray();
    const users = [];
    let active_users = 0
  
    for (const user of get_users) {
        const user_data = {
          user_name: user.displayName,
          email: user.email,
          active: (new Date(user.updated_at).getTime() + 14 * 24 * 60 * 60 * 1000) >= date,
          created_at: user.created_at
        };
        if (user_data.active === true) {
          active_users += 1
        }
        users.push(user_data);
      
    }
    let revenue = await this.userService.getTotalRevenue()
    return { 
      total_users,
      total_revenue: revenue.total_revenue , 
      total_bookings, 
      active_users, 
      deleted_users: revenue.deleted_users, 
      users: users.sort((a, b) => a.user_name.localeCompare(b.user_name))
    };

  }

  async computeAdminAnalytics2(email: string) {
    
    const user = await this.databaseManager.findOneDocument(this._udb, "email", email)
    const user_bookings = await this.bookingsService.get_user_service_bookings(user._id.toString());

    // CALCULATE USER TOTAL EARNINGS FROM BOOKINGS
    let booking, total_earning = 0
    for (booking of user_bookings[0].details) {
      total_earning += Number(booking.service_details.service_fee)
      console.log(total_earning)
    }

    // USER DATA OBJECT
    const user_data = {
      user_name: user.displayName,
      email: user.email,
      created_at: user.created_at,
      last_login: user.updated_at,
      total_earning: total_earning,
      total_bookings: user_bookings[0].details.length
    };
    return user_data
  }
}