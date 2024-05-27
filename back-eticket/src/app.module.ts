import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [AuthModule, UserModule, CategoriesModule, OrdersModule, CloudinaryModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
