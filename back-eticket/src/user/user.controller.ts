import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from 'src/dtos/user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from './role.enum';
import { AuthGuard } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';

@Controller('user')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}
    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuard, RoleGuard)
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

    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @Get(':id')
    getUserById(@Param('id',ParseUUIDPipe) id: string) {
        return this.userService.getUserById((id));
    }

    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuard, RoleGuard)
    @Put(':id')
    updateUser(@Param('id',ParseUUIDPipe) id: string, @Body() user: Partial<createUserDto>){
        return this.userService.updateUser(id, user);
    }
}

