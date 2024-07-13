// import * as postmark from 'postmark';
import { SendMailClient } from "zeptomail";
import cron from 'node-cron'
import fs from 'fs-extra'
import { BadRequestException } from "@nestjs/common";

// const mail = new postmark.ServerClient('9f332d3f-5c4d-42d5-b4c4-0959b0dd648a');

// v=spf1 +a +mx include:_spf.tld-mx.com ~all


// https://www.npmjs.com/package/zeptomail

// For ES6

// For CommonJS
// var { SendMailClient } = require("zeptomail");

const url = "api.zeptomail.com/";
const token = process.env.EMAIL_TOKEN

let client = new SendMailClient({url, token});


export async function sendOnboardingMail(to:string, name: string) {

  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: `Welcome, ${name}`,
    htmlbody: `<p> Hi <b>${name}</b>, </p> 
      <p> Thanks for joining the Luround community! We're happy to have you here! </p>
      <p> We created Luround to help professional service providers seamlessly manage their client relationships and we're glad you've 
      chosen us to help you meet your needs. 
      </p>
      <p> Please don't hesitate to reach out for 24/7 support at support@luround.com if you need assistance! </p>
      <p> To your success, </p>
      <p> C.C from Luround</p>`,
  })

}

export async function sendServiceUpdateEmail(to:string, name: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Services Page Update',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>We are currently making some updates on the Services page section of Luround, and I'm sorry about any disruptions that may occur as you use the app.</P>
      <p>When the updates are finished over the next 7 days, it will be much easier to create your services and share them with your network for bookings.</p>
      <p>Please be patient with us as we improve our product offering to you.</p>
      <p>C.C. from Luround</p>
      <p> Want to chat? Please email us at support@luround.com.</p>`
  });
}

export async function sendOTP(to:string, OTP: number, name: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Change Password Luround',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>There was a request to change your password!</P>
      <p>Please enter this otp to change your password: <b>${OTP}</b></p>
      <p>If you did not make this request, please ignore this email.</p>
      <p>For 24/7 Support: support@luround.com</p>`,
  });
}


export async function sendPlanExpiringMail(to:string, name: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Plan Expiring',
    htmlBody: `<p>Hi <b>${name.split(' ')[0]}</b>, </p>
      <p>Your plan on Luround is about to expire in 3 days.</P>
      <p>Please purchase a new plan to continue to enjoy Luround.</p>
      <p>You can renew your plan when you click on --More--Settings--Pricing..</p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function sendWalletPinResetOTP(to:string, OTP: number, name: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Change Password Luround',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>There was a request to change your wallet withdrawal pin!</P>
      <p>Please enter this otp to change your withdrawal pin: <b>${OTP}</b></p>
      <p>If you did not make this request, please ignore this email.</p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function WithdrawalSuccess(to:string, name: string, wallet_balance: number, amount:number) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Withdrawal Success From Luround Wallet',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>Your withdrawal of ${amount} from your wallet was successful.</P>
      <p>Your Wallet balance is ${wallet_balance}.</b></p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function WithdrawalFailed(to:string, name: string, wallet_balance: number, amount: number) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Withdrawal Failure From Luround Wallet',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>Your withdrawal of ${amount} from your wallet failed.</P>
      <p>Your Wallet balance is <b>${wallet_balance}.</b></p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function quoteRequested(to:string, name: string, service_provider: string, service_name: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": service_provider}}],
    subject: 'Quote Requested',
    htmlBody: `<p>Hi <b>${service_provider.split(' ')[0]}</b>, </p>
      <p>${name} requested a quote for your service <b>${service_name}</b>.
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function sendPaymentSuccessMail(to:string, name: string, plan: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Luround Payment Confirmation',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>You have successfully renewed your ${plan} plan.</P>
      <p> Thanks for your patronage.</p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function paymentFailed(to:string, name: string, service_provider: string, amount: number, service_booked: string) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": name}}],
    subject: 'Payment Failed',
    htmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>Your payment of <b> ${amount} </b> to ${service_provider} for <b>${service_booked}</b> failed.
      Please try again at a later time.</P>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function bookingRescheduled(to:string, booking_detail: any) {
  let meeting_location = await check_meeting_location(booking_detail)

  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": booking_detail.booking_user_info.displayName.split(' ')[0]}}],
    subject: 'Booking Reschedule',
    htmlBody: `<p>Hi <b>${booking_detail.booking_user_info.displayName.split(' ')[0]}</b>, </p>
      <p>Your booking with ${booking_detail.service_provider_info.displayName} has been rescheduled to ${booking_detail.service_details.date}.</P>
      <p> Here’s the breakdown - </p>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      New Date: <b>${booking_detail.service_details.date}</b>  <br>
      Time: <b>${booking_detail.service_details.time} </b> <br>
      Amount Paid: <b>${booking_detail.service_details.service_fee}</b> <br>
      Delivery: <b>${booking_detail.service_details.appointment_type} </b></p>
      <p>Virtual Meeting Link: <b> ${meeting_location}</b></p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function bookingConfirmed_account_viewer(to:string, booking_detail: any) {
  let meeting_location = await check_meeting_location(booking_detail)
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": booking_detail.booking_user_info.displayName.split(' ')[0]}}],
    subject: 'Booking Confirmed',
    htmlBody: `<p>Hi <b>${booking_detail.booking_user_info.displayName.split(' ')[0]}</b>, </p>
      <p>Your booking with ${booking_detail.service_provider_info.displayName} has been confirmed!</P>
      <p> Here’s the breakdown - </p>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      Date: <b>${booking_detail.service_details.date}</b>  <br>
      Time: <b>${booking_detail.service_details.time} </b> <br>
      Amount Paid: <b>${booking_detail.service_details.service_fee}</b> <br>
      Delivery: <b>${booking_detail.service_details.appointment_type} </b></p>
      <p>Virtual Meeting Link: <b> ${meeting_location}</b></p>`
  });
}
async function check_meeting_location(booking_detail: any) {
  let meeting_link = booking_detail.service_details.appointment_type === 'Virtual' ? booking_detail.service_details.location 
  : 'This is an In-Person event.'
  return meeting_link
}
export async function booking_account_viewer(to:string, booking_detail: any) {
  let meeting_location = await check_meeting_location(booking_detail)

  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to, "name": booking_detail.booking_user_info.displayName.split(' ')[0]}}],
    subject: 'Service Booking',
    htmlBody: `<p>Hi <b>${booking_detail.booking_user_info.displayName.split(' ')[0]}</b>, </p>
      <p>You have booked a service with ${booking_detail.service_provider_info.displayName}</P>
      <p> Here’s the breakdown - </p>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      Date: <b>${booking_detail.service_details.date}</b>  <br>
      Time: <b>${booking_detail.service_details.time} </b> <br>
      Amount Paid: <b>${booking_detail.service_details.service_fee}</b> <br>
      Delivery: <b>${booking_detail.service_details.appointment_type} </b></p>
      <p>Virtual Meeting Link: <b> ${meeting_location}</b></p>`
  });
}


export async function bookingConfirmed_service_provider(to:string, booking_detail: any) {
  let meeting_location = await check_meeting_location(booking_detail)

  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": booking_detail.booking_user_info.displayName.split(' ')[0]}}],
    subject: `New Booking From ${booking_detail.booking_user_info.displayName.split(' ')[0]}`,
    htmlBody: `<p>Hi <b>${booking_detail.service_provider_info.displayName.split(' ')[0]}</b>, </p>
      <p> ${booking_detail.booking_user_info.displayName.split(' ')[0]} booked your service ${booking_detail.service_details.service_name}</P>
      <p> Here’s the breakdown - </p>
      <p> Name of Client: <b>${booking_detail.booking_user_info.displayName}</b> <br>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      Date: <b>${booking_detail.service_details.date}</b>  <br>
      Time: <b>${booking_detail.service_details.time} </b> <br>
      Amount Paid: <b>${booking_detail.service_details.service_fee}</b> <br>
      Delivery: <b>${booking_detail.service_details.appointment_type} </b></p>
      <p>Virtual Meeting Link: <b> ${meeting_location}</b></p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function SendBookingNotificationEmail_ServiceProvider(to:string, booking_detail: any) {
  let meeting_location = await check_meeting_location(booking_detail)

  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": booking_detail.service_provider_info.displayName }}],
    subject: `Upcoming Appointment`,
    htmlBody: `<p>Hi <b>${booking_detail.service_provider_info.displayName.split(' ')[0]}</b>, </p>
      <p> Your appointment with ${booking_detail.booking_user_info.displayName.split(' ')[0]} is coming up in 24 hours</P>
      <p> Here’s the breakdown - </p>
      <p> Name of Client: <b>${booking_detail.booking_user_info.displayName}</b> <br>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      Appointment Time: <b>${booking_detail.service_details.time} </b> <br>
      Amount Paid: <b>${booking_detail.service_details.service_fee}</b> <br>
      Type of booking: <b>${booking_detail.service_details.appointment_type} </b></p>
      <p>Virtual Meeting Link: <b> ${meeting_location}</b></p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function SendBookingNotificationEmail_Client(to:string, booking_detail: any) {
  let meeting_location = await check_meeting_location(booking_detail)

  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to,"name": booking_detail.booking_user_info.displayName.split(' ')[0]}}],
    subject: `Upcoming Appointment`,
    htmlBody: `<p>Hi <b>${booking_detail.booking_user_info.displayName.split(' ')[0]}</b>, </p>
      <p> Your appointment with ${booking_detail.service_provider_info.displayName } is coming up in 24 hours</P>
      <p> Here’s the breakdown - </p>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      Appointment Time: <b>${booking_detail.service_details.time} </b> <br>
      Meeting Link: <b>${booking_detail.service_details.meeting_link}</b> <br>
      Type of booking: <b>${booking_detail.service_details.appointment_type} </b></p>
      <p>Virtual Meeting Link: <b> ${meeting_location}</b></p>
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function SendFeedBackEmail(from:string, name: string, subject: string, description: string) {
  return await client.sendMail({
    from: {"address": from, "name": name},
    to: [{"email_address": {"address": "support@luround.com","name": "Luround"}}],
    subject: subject,
    htmlBody: `<p>${description} </p>`
  });
}


const jobs = []

export async function scheduleEmailCronJob(date:string, booking_detail:any) {
  const targetDate = new Date(`${date}`)
  targetDate.setDate(targetDate.getDate() - 1);

  // Schedule the cron job to run at the target date and time
  const targetCronTime = `${targetDate.getUTCMinutes()} ${targetDate.getUTCHours()} ${targetDate.getUTCDate()} ${targetDate.getUTCMonth() + 1} 0`;

  // CALCULATE 1 HOUR 
  // const target_1hrCronTime = `${targetDate.getUTCMinutes()} ${targetDate.getUTCHours()} ${targetDate.getUTCDate()} ${targetDate.getUTCMonth() + 1} *`;

  cron.schedule(targetCronTime, async () => {
    console.log('Running email cron job')
    await SendBookingNotificationEmail_ServiceProvider(booking_detail.service_provider_info.email, booking_detail);
    await SendBookingNotificationEmail_Client(booking_detail.booking_user_info.email, booking_detail)
  });
  jobs.push({targetCronTime, booking_detail}) // [ { } ]
  await persistCronJobs()

  console.log('Email cron job scheduled');
}

async function persistCronJobs() {
  let savedJobs = jobs.map(job => ({
    date: job.targetCronTime, booking_detail: job.booking_detail
  }))
  fs.writeJson('./savedjobs.json', savedJobs, { spaces: 2})
  .then(() => {
    console.log("Cron Job Persisted!")
  })
  .catch((err: any) => {
    throw new BadRequestException({message: err.message})
  })
}

export async function loadCronJobs() {
  try {
    const jobConfigs = await fs.readJson('./savedjobs.json');
    jobConfigs.forEach(async ({ date, booking_detail }) => {
      cron.schedule(date, async () => {
        console.log('Running email cron job');
        await SendBookingNotificationEmail_ServiceProvider(booking_detail.service_provider_info.email, booking_detail);
        await SendBookingNotificationEmail_Client(booking_detail.booking_user_info.email, booking_detail)
      });
    });
    console.log('Email cron jobs re-scheduled');
  } catch (error) {
    console.error('Error loading cron jobs:', error);
    throw new BadRequestException({message: error.message})
  }
}

// export async function calculateTotalRevenue(new_revenue: number, deleted_user: number) {
//   try {
//     // Read the existing revenue from the file
//     let data = fs.readJson('./revenue.json') // .catch(() => ({ total_revenue: 0, deleted_users: 0 }));

//     // Update the total revenue
//     let total_revenue = data.total_revenue
//     let deleted_users = data.deleted_users
//     total_revenue += new_revenue;
//     deleted_users += deleted_user

//     // Write the updated revenue back to the file
//     fs.writeJson('./revenue.json', { total_revenue, deleted_users }, { spaces: 2 });

//     console.log("Total revenue updated successfully:", total_revenue);
//   } catch (err) {
//     throw new BadRequestException({ message: err.message });
//   }
// }

// export async function getTotalRevenue() {
//   try {
//     // Read the existing revenue from the file
//     let data = fs.readJson('./revenue.json') // .catch(() => ({ total_revenue: 0, deleted_users: 0 }));

//     // Return the total revenue
//     console.log(data)
//     return {total_revenue: data.total_revenue, deleted_users: data.deleted_users}
//   } catch (err) {
//     throw new BadRequestException({ message: err.message });
//   }
// }


export async function generateRandomSixDigitNumber(): Promise<number> {
  const min = 100000; 
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function generateRandomAlphabets(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charactersLength = characters.length;
  return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * charactersLength))).join('');
}

export function convertToDateTime(timeStr) {
  // Get the current date
  const currentDate = new Date();

  // Split the time string into time and period (AM/PM)
  const [time, period] = timeStr.split(' ');
  
  // Split the time part into hours and minutes
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  // Convert to 24-hour format if PM
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  // Set the hours and minutes to the current date
  currentDate.setHours(hours) + 1;
  currentDate.setMinutes(minutes);
  currentDate.setSeconds(0);
  currentDate.setMilliseconds(0);

  return currentDate.toString();
}