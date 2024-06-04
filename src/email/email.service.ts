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
    const url = `http://localhost:3001/auth/confirm?token=${token}`;

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
                  <h1>Bienvenido a Radioticket</h1>
              </div>
              <p>Hola, {{token}}!</p>
              <p>Gracias por registrarte en Radioticket. Estamos emocionados de tenerte con nosotros.</p>
              <a href="${url}" class="button">Verificar mi cuenta</a>
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
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
          <p>Evento: ${ticket.event.name}</p>
          <p>Fecha: ${ticket.event.date}</p>
          <p>Lugar: ${ticket.event.location}</p>
          <p>ID del Ticket: ${ticket.id}</p>
          <p>Zona: ${ticket.zone}</p>
          <p>Código QR:</p>
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
              <p>Hola,</p>
              <p>¡Gracias por tu compra! A continuación, encontrarás los detalles de tus tickets:</p>
              ${ticketDetails.join('')}
              <p>Por favor, presenta estos códigos QR al ingresar al evento. Puedes mostrarlos desde tu dispositivo móvil o imprimirlos.</p>
              <p>Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos a [Email de Soporte] o llamarnos al [Número de Teléfono].</p>
              <p>¡Nos vemos en el evento!</p>
              <p>Saludos,</p>
              <p>[Nombre de tu Empresa]</p>
          </div>
      </body>
      </html>
    `;

    await this.transporter.sendMail({
      from: '"RadioTicket" <radioticket@gmail.com>',
      to,
      subject: 'Estos son tus tickets',
      html: emailContent,
    });
}

}
