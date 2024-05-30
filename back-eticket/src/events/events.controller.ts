import {
  Controller,
  Param,
  Query,
  Get,
  Post,
  Body,
  Put,
  ParseUUIDPipe,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';
import { Request } from 'express';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/role.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { User } from 'src/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { categoryInterceptor } from 'src/interceptors/categoryAMayuscula';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page || !limit) return this.eventsService.getEvents(1, 5);
    return this.eventsService.getEvents(Number(page), Number(limit));
  }

  @Get('antiguosPrimero')
  getEventsAntiguosARecientes(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page || !limit) return this.eventsService.getEventsAntiguosARecientes(1, 5);
    return this.eventsService.getEventsAntiguosARecientes(Number(page), Number(limit));
  }

  @Get('recientesPrimero')
  getEventsRecientesAAntiguos(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page || !limit) return this.eventsService.getEventsRecientesAAntiguos(1, 5);
    return this.eventsService.getEventsRecientesAAntiguos(Number(page), Number(limit));
  }

  @Get('all')
  getAllEvents(){
    return this.eventsService.getAllEvents();
  }

  @Get('alphabetical')
  getEventsAZ(
      @Query('order') order: 'ascending' | 'descending',
      @Query('page') page: string, 
      @Query('limit') limit: string
    ) {
    if (!page || !limit) return this.eventsService.getEventsAZ(order, 1, 5);
    return this.eventsService.getEventsAZ(order, Number(page), Number(limit));
  }
  @Get('bycategory')
  getEventsByCategory(@Query('page') page: string, @Query('limit') limit: string, @Query('category') category:string) {
    console.log(category.toUpperCase());
    
    if (!page || !limit) return this.eventsService.getEventsByCategory(String(1), String(5), category.toUpperCase());
    return this.eventsService.getEventsByCategory(page, limit,category.toUpperCase());
  }

  @Get('price')
  getEventsByPrice(
    @Query('order') order: 'ascending' | 'descending',
    @Query('page') page: string, 
    @Query('limit') limit: string
  ) {
    
    if (!page || !limit) return this.eventsService.getEventsByPrice(order, 1, 5);
    return this.eventsService.getEventsByPrice(order, Number(page), Number(limit));
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('seeder')
  preLoadData() {
    return this.eventsService.preLoadData();
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  @ApiBearerAuth()
  @UseInterceptors(categoryInterceptor)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Post()
  postEvent(@Body() event: PostEventDto, @Req() req: Request & { user: User }) {
    console.log("llego hasta aca");
    
    const { email } = req.user;
    return this.eventsService.postEvent(event, email);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Put(':id')
  modifyEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request & { user: User },
    @Body() event: ModifyEventDto,
  ) {
    const { email } = req.user;
    return this.eventsService.modifyEvent(id, event, email);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @Delete()
  deleteEvent(id: string) {
    return this.deleteEvent(id);
  }
}
