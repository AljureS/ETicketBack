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
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
      <style>
          * {
        margin: 0;
        padding: 0;
      }
      .main {
        padding: 1rem 0 1.5rem 0;
        background-color: #EDF2F7;
        font-family: "Roboto", sans-serif;
      }
      @media screen and (max-width: 769px) {
        .main {
          padding: 3rem 0 0.5rem 0;
        }
      }
      </style>
      </head>
      <body>
          <section class="main">
          <a href="${url}">Click here to confirm your account</a>
          </section>
      </body>
      </html>`,
    });
  }
}
