import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import * as pdf from 'html-pdf';

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
      tls: {
        rejectUnauthorized: false, // Estaba pidiendo conexion segura (Ya no es necesario)
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

  async sendResetPasswordEmail(to: string, resetUrl: string) {
    await this.transporter.sendMail({
      from: '"RadioTicket" <radioticket@gmail.com>',
      to,
      subject: 'Restablecimiento de contraseña',
      text: `Haga clic en el siguiente enlace para restablecer su contraseña: ${resetUrl}`,
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
                  <h1>Restablecimiento de contraseña</h1>
              </div>
              <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
              <p>Si no solicitó un restablecimiento de contraseña, por favor ignore este correo.</p>
          </div>
      </body>
      </html>`,
    });
  }

  async sendTickets(to: string, tickets: any[]) {
    const qrCodeDir = './qrcodes';
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir);
    }

    const pdfPath = 'tickets.pdf';
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              .ticket {
                  margin-bottom: 20px;
                  padding: 10px;
                  border: 1px solid #ccc;
                  border-radius: 5px;
                  overflow: auto; /* Clearfix */
                  position:relative;
              }
              .ticket-info {
                  float: left;
                  width: calc(100% - 120px); /* Ancho del texto menos el ancho del QR */
              }
              .qr-code {
                  position:absolute;
                  right:0;
                  top:0;
                  width: 200px;
                  height: 200px;
              }
              .logo{
                width:170px;
                margin-left:calc(50% - 85px);
                margin-bottom:20px;
              }
          </style>
      </head>
      <body>
          <div style="margin: 50px;">
          <img class="logo" alt="Logo Radioticket" src="https://res.cloudinary.com/dqowrhckh/image/upload/v1718308196/Imagen_de_WhatsApp_2024-05-21_a_las_15.56.47_f7685e5b_zrtsjw.jpg">
          <p>Equipo Radioticket</p>
          `; // Contenedor principal

    for (const ticket of tickets) {
      const qrCodeData = await QRCode.toDataURL(ticket.id);
      const qrCodeFileName = `qr_code_${ticket.id}.png`;

      fs.writeFileSync(path.join(qrCodeDir, qrCodeFileName), qrCodeData);

      htmlContent += `
        <div class="ticket">
          <div class="ticket-info">
              <p><strong>Event:</strong> ${ticket.event.name}</p>
              <p><strong>Date:</strong> ${ticket.event.date}</p>
              <p><strong>Latitude:</strong> ${ticket.event.latitude}</p>
              <p><strong>Longitude:</strong> ${ticket.event.longitude}</p>
              <p><strong>ID del Ticket:</strong> ${ticket.id}</p>
              <p><strong>Ticket Type:</strong> ${ticket.zone}</p>
          </div>
          <img class="qr-code" src="${qrCodeData}" alt="QR Code">
        </div>`;
    }

    htmlContent += `
          </img>
      </body>
      </html>`;

    // Opciones para el PDF
    const pdfOptions = { format: 'Letter' }; // Puedes ajustar el formato según tus necesidades

    // Generar PDF desde HTML
    pdf.create(htmlContent, pdfOptions).toFile(
      pdfPath,
      async function (err, res) {
        if (err) return console.log(err);

        const mailOptions = {
          from: '"RadioTicket" <radioticket@gmail.com>',
          to,
          subject: 'Here are your tickets',
          text: '"Carefully keep the following tickets and enjoy your event!".',
          attachments: [
            {
              filename: 'tickets.pdf',
              path: pdfPath,
              contentType: 'application/pdf',
            },
          ],
        };

        // Enviar correo con los tickets adjuntos
        await this.sendMail(mailOptions);

        // Limpiar directorio de códigos QR y archivo PDF después de enviar el correo
        fs.rmdirSync(qrCodeDir, { recursive: true });
        fs.unlinkSync(pdfPath);
      }.bind(this),
    );
  }

  // Función para enviar correo
  async sendMail(mailOptions) {
    // Enviar correo
    await this.transporter.sendMail(mailOptions);
  }

  async sendNewEventEmail(to: string, event: any) {
    const { name, description, date, address } = event;
    await this.transporter.sendMail({
      from: '"RadioTicket" <radioticket@gmail.com>',
      to,
      subject: 'Nuevo evento creado: ' + name,
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
                  <h1>Nuevo evento creado: ${name}</h1>
              </div>
              <p>${description}</p>
              <p><strong>Fecha:</strong> ${date}</p>
              <p><strong>Dirección:</strong> ${address}</p>
              <p>¡No te lo pierdas!</p>
          </div>
      </body>
      </html>`,
    });
  }

  async sendNewDiscountEmail(to: string, eventName: string, discountCode: string) {
    await this.transporter.sendMail({
      from: '"RadioTicket" <radioticket@gmail.com>',
      to,
      subject: '¡Nuevo descuento disponible!',
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
                  <h1>¡Nuevo descuento disponible para ${eventName}!</h1>
              </div>
              <p>Hemos creado un nuevo descuento para el evento ${eventName}.</p>
              <p>Usa el siguiente código para obtener tu descuento: <strong>${discountCode}</strong></p>
              <p>¡No te lo pierdas!</p>
          </div>
      </body>
      </html>`,
    });
  }
  


}

