import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from 'src/dtos/discount.dto';

@Controller('discount')
export class DiscountController {
    constructor(
        private readonly discountService: DiscountService
    ) {}

    @Get('verify')
    async findByCode(@Query('code') code: string) {
        const isValid = await this.discountService.findByCode(code);

        if (!isValid) {
            return  "Discount code is not valid" ;
        }
        return  isValid ; 
    }

    @Get(':id')
    getDiscounts(@Param('id', ParseUUIDPipe) eventId: string) {
        return this.discountService.getDiscounts(eventId);
    }

    @Post('create/:id')
    creteDiscount(
        @Param('id', ParseUUIDPipe) eventId: string,
        @Body() discountDto: CreateDiscountDto 
    ) {
        const { discount } = discountDto;
        return this.discountService.createDiscount(eventId, discount);
    }
}
