import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { AuthGuards } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { Request } from 'express';
import { User } from 'src/entities/user.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @ApiBearerAuth()

    @Roles(Role.USER,Role.ADMIN, Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
    @Post()
    async addOrder(@Body() order: CreateOrderDto, @Req() req:Request & {user:User}) {
        order.userId = req.user.id
        return this.orderService.addOrder(order);
    }

    @Get()
    getAllOrder() {
        return this.orderService.getAllOrder();
    }
    @Get('/success')
    async paymentSuccess(@Query('external_reference') externalReference: string) {
      const order: CreateOrderDto = JSON.parse(externalReference); // Recupera la orden desde la referencia externa
    //   await this.orderService.processOrder(order); // Procesa la orden después del pago
    }
    @Get('/execute')
    async paymentExecutte(@Query('token') token: string) {
        
         // Recupera la orden desde la referencia externa
        return await this.orderService.executePayment(token); // Procesa la orden después del pago
      }
    @Get(':id')
    getOrder(@Param('id') id: string) {
        return this.orderService.getOrder(id);
    }
}
