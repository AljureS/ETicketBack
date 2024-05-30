import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @Post()
    addOrder(
        @Body() order: CreateOrderDto
    ) {
        return this.orderService.addOrder(order);
    }

    @Get(':id')
    getOrder(@Param('id') id: string) {
        return this.orderService.getOrder(id);
    }

    @Get()
    getAllOrder() {
        return this.orderService.getAllOrder()
    }
}
