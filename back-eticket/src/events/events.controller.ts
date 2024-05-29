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

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page || !limit) return this.eventsService.getEvents(1, 5);
    return this.eventsService.getEvents(Number(page), Number(limit));
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
