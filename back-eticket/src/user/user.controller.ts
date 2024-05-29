import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from 'src/dtos/user.dto';

@Controller('user')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}

    @Get()
    getUsers(
        @Query('page') page: string,
        @Query('limit') limit: string
    ) {
        if (!page && !limit) {
            return this.userService.getUsers(1, 5);
        } else if(!page && limit){
            return this.userService.getUsers(1, Number(limit));
        } else if (page && !limit) {
            return this.userService.getUsers(Number(page), 5);
        } else return this.userService.getUsers(Number(page), Number(limit));
    }

    @Get(':id')
    getUserById(@Param('id') ParseUUIDPipe ,id: string) {
        return this.userService.getUserById((id));
    }

    @Put(':id')
    updateUser(@Param('id') ParseUUIDPipe, id: string, @Body() user: Partial<createUserDto>){
        return this.userService.updateUser(id, user);
    }
}

