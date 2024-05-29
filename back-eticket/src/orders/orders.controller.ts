import { Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
    constructor(private readonly orderService: OrdersService) {}

    @Post()
    addOrder() {
        return this.orderService.addOrder();
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
