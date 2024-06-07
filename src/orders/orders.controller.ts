import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from 'src/dtos/createOrder.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { AuthGuards } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { Request, Response } from 'express';
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
    @ApiBearerAuth()
    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
    @Post('/createProduct')
    async createProductForPaypalSubscription(){
      return this.orderService.createProductForPaypalSubscription()
    }
    @ApiBearerAuth()
    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
    @Post('/createPlan')
    async createPlanForPaypalSubscription(@Body('product_id')product_id:string){
      return this.orderService.createPlanForPaypalSubscription(product_id)
    }
    @ApiBearerAuth()
    @Roles(Role.USER,Role.ADMIN, Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
    @Post('/generatesubscripcion')
    async generateSubscripcion(@Req() req:Request & {user:User}){
      const { plan_id } = req.body
      
      
      const user = {
        name:req.user.name,
        lastName: req.user.lastName,
        email:req.user.email
      }
      console.log(user);
      return await this.orderService.generateSubscription(plan_id,user)
    }

    @Get('/execute-subscription')
    async executeSubscription(@Req() req, @Res() res){
      return await this.orderService.executeSubscription(req,res)
    }
    @Get('/cancel-subscription')
    async cancelSubscription(@Req() req, @Res() res){
      return this.orderService.cancelSubscription(req,res)
    }
    @Get()
    async getAllOrder() {
        return await this.orderService.getAllOrder();
    }
    @Get('/success')
    async paymentSuccess(@Query('external_reference') externalReference: string) {
      const order: CreateOrderDto = JSON.parse(externalReference); // Recupera la orden desde la referencia externa
    //   await this.orderService.processOrder(order); // Procesa la orden después del pago
    }
    @Get('/execute')
    async paymentExecutte(@Query('token') token: string,@Res() res:Response) {
         // Recupera la orden desde la referencia externa
        return await this.orderService.executePayment(token,res); // Procesa la orden después del pago
      }
    @Get(':id')
    getOrder(@Param('id') id: string) {
        return this.orderService.getOrder(id);
    }
}
