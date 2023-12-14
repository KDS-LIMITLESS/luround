import * as postmark from 'postmark';
const mail = new postmark.ServerClient('9f332d3f-5c4d-42d5-b4c4-0959b0dd648a');



export async function sendOnboardingMail(to:string, name: string) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: `Welcome, ${name}`,
    HtmlBody: `<p> Hi <b>${name}</b>, </p> 
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
      <p> Please don't hesitate to reach out for 24/7 support at support@luround.com if you need assistance! </p>
      <p> We're so happy you're part of this community! </p> 
      <p> Thanks, </p>
      <p> C.C from Luround</p>`,
    MessageStream: 'outbound'
  });
}



export async function sendOTP(to:string, OTP: number, name: string) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: 'Change Password Luround',
    HtmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>There was a request to change your password!</P>
      <p>Please enter this otp to change your password: <b>${OTP}</b></p>
      <p>If you did not make this request, please ignore this email.</p>
      <p>For 24/7 Support: support@luround.com | 0913xxxxxx3</p>`,
    MessageStream: 'outbound'
  });
}

export async function sendWalletPinResetOTP(to:string, OTP: number, name: string) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: 'Change Password Luround',
    HtmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>There was a request to change your wallet withdrawal pin!</P>
      <p>Please enter this otp to change your withdrawal pin: <b>${OTP}</b></p>
      <p>If you did not make this request, please ignore this email.</p>
      <p>For 24/7 Support: support@luround.com | 0913xxxxxx3</p>`,
    MessageStream: 'outbound'
  });
}

export async function WithdrawalSuccess(to:string, name: string, wallet_balance: number, amount:number) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: 'Withdrawal Success From Luround Wallet',
    HtmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>Your withdrawal of ${amount} from your wallet was successful.</P>
      <p>Your Wallet balance is ${wallet_balance}.</b></p>
      <p>For 24/7 Support: support@luround.com | 0913xxxxxx3</p>`,
    MessageStream: 'outbound'
  });
}

export async function WithdrawalFailed(to:string, name: string, wallet_balance: number, amount: number) {
  return mail.sendEmail({
    From: 'cc@uppist.com',
    To: to,
    Subject: 'Withdrawal Failure From Luround Wallet',
    HtmlBody: `<p>Hi <b>${name}</b>, </p>
      <p>Your withdrawal of ${amount} from your wallet failed.</P>
      <p>Your Wallet balance is <b>${wallet_balance}.</b></p>
      <p>For 24/7 Support: support@luround.com | 0913xxxxxx3</p>`,
    MessageStream: 'outbound'
  });
}

export async function generateRandomSixDigitNumber(): Promise<number> {
  const min = 100000; 
  const max = 999999;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}