import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
}
