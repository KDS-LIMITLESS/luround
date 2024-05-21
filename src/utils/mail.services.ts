// import * as postmark from 'postmark';
import { SendMailClient } from "zeptomail";

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
      <p> We created Luround to help professional service providers seamlessly and easily operate
        different parts of their business from a single platform, and we're glad you've chosen us to help
        you meet your needs. 
      </p>
      <p> Over the next few weeks, we'll be integrating new features and updates to make your
        experience with Luround much more pleasant. We will also be checking in with you and sending
        materials that will help you get started with those new features to ensure you get the most out of
        it.
      </p>
      <p> Since you’ve recently downloaded the Luround app, you automatically have 30 days of free trial. 
        We hope that this window of time gives you new opportunities to further grow your business.
      </p>
      <p> Please don't hesitate to reach out for 24/7 support at support@luround.com if you need assistance! </p>
      <p> We're so happy you're part of this community! </p> 
      <p> Thanks, </p>
      <p> C.C from Luround</p>`,
  })

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
      <p>For 24/7 Support: support@luround.com</p>`
  });
}

export async function bookingConfirmed_account_viewer(to:string, booking_detail: any) {
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
      Delivery: <b>${booking_detail.service_details.appointment_type} </b></p>`
  });
}

export async function booking_account_viewer(to:string, booking_detail: any) {
  return await client.sendMail({
    from: {"address": "support@luround.com", "name": "Luround"},
    to: [{"email_address": {"address": to, "name": booking_detail.booking_user_info.displayName.split(' ')[0]}}],
    subject: 'Service Booking',
    htmlBody: `<p>Hi <b>${booking_detail.booking_user_info.displayName.split(' ')[0]}</b>, </p>
      <p>You have booked a service with ${booking_detail.service_provider_info.displayName}, and you will receive a confirmation email once ${booking_detail.service_provider_info.displayName} has confirmed your booking</P>
      <p> Here’s the breakdown - </p>
      <p> Service booked: <b>${booking_detail.service_details.service_name}</b> <br>
      Date: <b>${booking_detail.service_details.date}</b>  <br>
      Time: <b>${booking_detail.service_details.time} </b> <br>
      Amount Paid: <b>${booking_detail.service_details.service_fee}</b> <br>
      Delivery: <b>${booking_detail.service_details.appointment_type} </b></p>`
  });
}


export async function bookingConfirmed_service_provider(to:string, booking_detail: any) {
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
      <p>For 24/7 Support: support@luround.com</p>`
  });
}



export async function generateRandomSixDigitNumber(): Promise<number> {
  const min = 100000; 
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}