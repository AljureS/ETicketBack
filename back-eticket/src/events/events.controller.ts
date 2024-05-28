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
} from '@nestjs/common';
import { EventsService } from './events.service';
import { PostEventDto } from 'src/dtos/postEvent.dto';
import { ModifyEventDto } from 'src/dtos/modifyEvent.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(@Query('page') page: string, @Query('limit') limit: string) {
    if (!page || !limit) return this.eventsService.getEvents(1, 5);
    return this.eventsService.getEvents(Number(page), Number(limit));
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  @Post()
  postEvent(@Body() event: PostEventDto) {
    return this.eventsService.postEvent(event);
  }
  @Put()
  modifyEvent(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() event: ModifyEventDto,
  ) {
    return this.eventsService.modifyEvent(id, event);
  }

  @Delete()
  deleteEvent(id: string) {
    return this.deleteEvent(id)
 }

  //TODO: dejar para despues de realizado el crud basico
  @Get('seeder')
  addEvents() {
    return this.eventsService.addEvents();
  }
}
