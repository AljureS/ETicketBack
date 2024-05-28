import { Controller, Param, Query, Get} from '@nestjs/common';
import { EventsService } from './events.service';

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

  @Get('seeder')
  addEvents() {
    return this.eventsService.addEvents();
  }
}
