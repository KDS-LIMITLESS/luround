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
