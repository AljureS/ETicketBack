import {DataSourceOptions, DataSource} from 'typeorm'
import { config as dotenvConfig } from 'dotenv';
import { registerAs } from '@nestjs/config';


dotenvConfig({ path: '.env.development' });

const config = {
  type: 'postgres',
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT as unknown as number,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  entities:['dist/**/*.entity{.ts,.js}'],
  migrations:['dist/migrations/*{.js,.ts}'],
  logging: true,
  synchronize: true,
  dropSchema:true
};

export default registerAs('typeorm', ()=> config)

export const connectionSource = new DataSource(config as DataSourceOptions)