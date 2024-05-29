import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from 'src/dtos/login.dto';
import { createUserDto } from 'src/dtos/user.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async signUp(user: createUserDto) {
        const { email, password} = user
        // Verificar si el email esta registrado 
        const userEmail = await this.userRepository.getUserByEmail(email)// llamda al repository de users 
        if (userEmail) { 
            throw new BadRequestException('Email already registered')
        }
        
        //REGISTRO ----
        //* Hashear password 
        const hashedPassword = await bcrypt.hash(password, 10)

        //*BBDD
        return await this.userRepository.createUser({...user, password: hashedPassword})
    }

    async logIn(credentials: LoginUserDto) {
        const { email, password} = credentials
        const user = await this.userRepository.getUserByEmail(email)
        if (!user) {  
            throw new BadRequestException('Invalid credentials')
        }
        // Comparacion de passwords
        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            throw new BadRequestException('Invalid credentials')
        }
        //envio de token //* forma token
        const payload = {id: user.id, email: user.email, isAdmin: user.isAdmin, isSuperAdmin: user.isSuperAdmin}
        const token = await this.jwtService.sign(payload)
        //Retornar mensaje de ingreso y token 
        return {
            message: 'Logged user',
            token
        }

    }

    async updateRole(id: string) {
        const userID = await this.usersRepository.findOneBy({ id})

        if (!userID) {
            throw new NotFoundException(`User with ID ${id} not found.`)
        }
        
        const newIsAdmin = !userID.isAdmin;
        const updateResult = await this.usersRepository.update(id, { isAdmin: newIsAdmin });
        
        return `User with ID: ${id} have had his role updated.`;
    }
}
