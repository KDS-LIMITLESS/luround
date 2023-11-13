import * as postmark from 'postmark';
const mail = new postmark.ServerClient('9f332d3f-5c4d-42d5-b4c4-0959b0dd648a');



export async function sendOnboardingMail(to:string, name: string) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: 'Luround',
    HtmlBody: `<h3> Hi ${name}, </br> <p> welcome to Luround </p></h3>`,
    MessageStream: 'outbound'
  });
}



export async function sendOTP(to:string, OTP: number) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: 'Change Password Luround',
    HtmlBody: `<h3> You have requested to update your luround password, </br> Please use this OTP to complete this request. <p>${OTP}. </p></h3>`,
    MessageStream: 'outbound'
  });
}

export async function generateRandomSixDigitNumber(): Promise<number> {
  const min = 100000; // Smallest 6-digit number
  const max = 999999; // Largest 6-digit number

  return Math.floor(Math.random() * (max - min + 1)) + min;
}