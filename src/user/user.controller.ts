import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from 'src/dtos/user.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from './role.enum';
import { AuthGuards } from 'src/guards/auth/auth.guard';
import { RoleGuard } from 'src/guards/roles/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { modifyUserDto } from 'src/dtos/modifyUser.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
    constructor (
        private readonly userService: UserService
    ) {}

    @ApiBearerAuth()
    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
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

    @ApiBearerAuth()
    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
    @Get(':id')
    getUserById(@Param('id',ParseUUIDPipe) id: string) {
        return this.userService.getUserById((id));
    }

    @ApiBearerAuth()
    @Roles(Role.SUPERADMIN)
    @UseGuards(AuthGuards, RoleGuard)
    @Put(':id')
    updateUser(@Param('id',ParseUUIDPipe) id: string, @Body() user: modifyUserDto){
        return this.userService.updateUser(id, user);
    }
}

