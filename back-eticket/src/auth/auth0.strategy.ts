// import { config as dotenvConfig } from 'dotenv';
// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, VerifyCallback } from 'passport-auth0';

// dotenvConfig({ path: '.env.development' });
// @Injectable()
// export class Auth0Strategy extends PassportStrategy(Strategy) {
//     constructor() {
//         super({
//         domain: process.env.YOUR_AUTH0_DOMAIN,
//         clientID: process.env.YOUR_AUTH0_CLIENT_ID, // 'YOUR_AUTH0_CLIENT_ID',
//         clientSecret: process.env.YOUR_AUTH0_CLIENT_SECRET, // 'YOUR_AUTH0_CLIENT_SECRET',
//         callbackURL: 'http://localhost:3000/callback',
//         });
//     }

//     validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): void {
//         done(null, profile);
//     }
// }
