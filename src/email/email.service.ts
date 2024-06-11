import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { TicketVendido } from 'src/entities/ticketVendido.entity';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL, // Tu email
        pass: process.env.NODEMAILER_PASSWORD, // Tu contraseña
      },
    });
  }

  async sendConfirmationEmail(to: string, token: string) {
    const url = `${process.env.BACK_URL}/auth/confirm?token=${token}`;

    await this.transporter.sendMail({
      from: '"RadioTicket" <radioticket@gmail.com>',
      to,
      subject: 'Confirm your account',
      text: `Click the link to confirm your account: ${url}`,
      context: {
        // Data to be sent to template engine.
        verificationLink: url,
      },
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
              }
              .container {
                  padding: 20px;
                  text-align: center;
                  background-color: #f4f4f4;
                  border-radius: 10px;
                  max-width: 600px;
                  margin: auto;
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 0;
                  border-radius: 10px 10px 0 0;
              }
              .button {
                  background-color: #4CAF50;
                  color: white;
                  padding: 15px 25px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
                  display: inline-block;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Welcome to Radioticket</h1>
              </div>
              <p>Hi, {{token}}!</p>
              <p>Thanks for signing up. We are happy to have you here.</p>
              <a href="${url}" class="button">Verify Email</a>
              <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
      </body>
      </html>
      `,
    });
  }

  async sendTickets(to: string, tickets: TicketVendido[]) {
    // Genera los códigos QR para cada ticket
    const ticketDetails = await Promise.all(tickets.map(async (ticket) => {
      const qrCodeDataURL = await QRCode.toDataURL(ticket.id);
      return `
        <div style="border-bottom: 1px solid #ccc; padding-bottom: 20px;">
          <p>Event: ${ticket.event.name}</p>
          <p>Date: ${ticket.event.date}</p>
          <p>Latitude: ${ticket.event.latitude}</p>
          <p>Longitude: ${ticket.event.longitude}</p>
          <p>ID del Ticket: ${ticket.id}</p>
          <p>Ticket Tipe: ${ticket.zone}</p>
          <p> QR Code :</p>
          <img src="${qrCodeDataURL}" alt="Código QR" />
        </div>
      `;
    }));
    
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              body {
                  font-family: Arial, sans-serif;
              }
              .container {
                  padding: 20px;
                  background-color: #f4f4f4;
                  border-radius: 10px;
                  max-width: 600px;
                  margin: auto;
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 0;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Tus Tickets de Radioticket</h1>
              </div>
              <p>Hi,</p>
              <p>¡Thanks for your purchase! Following more information about your tickets:</p>
              ${ticketDetails.join('')}
              <p>Please present these QR codes upon entering the event. You can display them from your mobile device or print them out.</p>
              <p>If you have any questions or need assistance, please do not hesitate to contact us at [Support Email] or call us at [Phone Number].</p>
              <p>¡See you ate the event!</p>
              <p>[Name of the company]</p>
          </div>
      </body>
      </html>
    `;

    const attachments = await Promise.all(tickets.map(async (ticket) => {
      const qrCodeBuffer = await QRCode.toBuffer(ticket.id);
      return {
          filename: `qr_code_${ticket.id}.png`,
          content: qrCodeBuffer,
          encoding: 'base64',
      };
  }));
  
  await this.transporter.sendMail({
      from: '"RadioTicket" <radioticket@gmail.com>',
      to,
      subject: 'Here are your tickets',
      html: emailContent,
      attachments: attachments,
  });
}

}
