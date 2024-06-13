import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from 'src/dtos/login.dto';
import { createUserDto } from 'src/dtos/user.dto';
import { User } from 'src/entities/user.entity';
import { UserRepository } from 'src/user/user.repository';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import axios from 'axios';
import { config as dotenvConfig } from 'dotenv';
import * as jwt from 'jsonwebtoken';

dotenvConfig({ path: '.env.development' });
@Injectable()
export class AuthService {
  constructor( 
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async refreshtoken(email, token) {

    // Verificar y desestructurar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Usa la misma clave secreta
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }

    // Verificar que el email en el payload del token sea el mismo que se pasa por body
    if (decoded.email !== email) {
      throw new UnauthorizedException('Email in token does not match the provided email');
    }

    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...payload } = user;

    
    const newToken = await this.jwtService.sign(payload, { expiresIn: '1h' } );
    return {
      message: 'refreshed token for user',
      newToken,
    };
  }

  async getAuth0UserDetails(token: string) {
    try {
        const response = await axios.get(`https://${process.env.AUTH0_BASE_URL}/userinfo`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // Desestructuración de la información del token
        const { given_name: name, family_name: lastName, email } = response.data;
        return { name, lastName, email };
    } catch (error) {
        throw new BadRequestException('Invalid token');
    }
}

  async Auth0 (userDetail: any) {
    console.log(userDetail);
    
    const { email } = userDetail;
    const user = await this.userRepository.getUserByEmail(email);

    if (user) {
      const { password, ...payload } = user;

      const token = await this.jwtService.sign(payload);
      return {
        message: 'Auth 0 User logged in successfully',
        token,
      };
    }
    const numero = Math.floor(100000000 + Math.random() * 900000000);
    const hash = await bcrypt.hash(numero.toString(), 10);
    const userCreated = await this.usersRepository.create({
      name:userDetail.name,
      lastName:userDetail.lastName,
      email:userDetail.email,
      phone: '', 
      isEmailConfirmed: true, //=> Por defecto el email es confirmado
      password: hash,
    });

    const savedUser = await this.usersRepository.save(userCreated);
    if (!savedUser) {
      throw new InternalServerErrorException('Error saving user');
    }

    const confirmationToken = await this.generateConfirmationToken(userDetail);

    await this.confirmEmail(
      confirmationToken,
    );
      console.log(savedUser);
      
      const { password, ...payload } = userCreated;

    const token = await this.jwtService.sign(payload);
    //Retornar mensaje de ingreso y token 
    return {
      message: 'Auth 0 User created successfully',
      token,
      savedUser
    };

  }

  async signUp(user: any) {
    const { email, password } = user;
    // Verificar si el email esta registrado
    const userEmail = await this.userRepository.getUserByEmail(email); // llamda al repository de users
    if (userEmail) {
      throw new BadRequestException('Email already registered');
    }

    //REGISTRO ----
    //* Hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    //*BBDD
    const userCreated = await this.userRepository.createUser({
      ...user,
      password: hashedPassword,
    });
    // Genera un token de confirmación (esto puede ser un JWT, un UUID, etc.)
    const confirmationToken = await this.generateConfirmationToken(user);
    // const confirmationToken = "token";

    // Envía el correo de confirmación
    await this.emailService.sendConfirmationEmail(
      user.email,
      confirmationToken,
    );
    return userCreated; 
  }
  async confirmEmail(token: string) {
    // Lógica para verificar el token y confirmar el usuario
    // const user = await this.verifyConfirmationToken(token);
    const user = await this.verifyConfirmationToken(token);
    user.isEmailConfirmed = true;
    await this.usersRepository.save(user);
    return user;
  }

  private async verifyConfirmationToken(token: string) {
    // Implementa tu lógica para verificar el token
    const secret = process.env.JWT_SECRET;
    const user = await this.jwtService.verify(token, { secret });
    return await this.usersRepository.findOne({ where: { email: user.email } });
  }
  private async generateConfirmationToken(user:User) {
    // Implementa tu lógica para generar un token de confirmación
    const payload = {
      ...user
    };
    const token = await this.jwtService.sign(payload);
    return token;
  }

  async logIn(credentials: LoginUserDto) {
    const { email } = credentials;
    const passwordDeParametro = credentials.password
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    // Comparacion de passwords
    const validPassword = await bcrypt.compare(passwordDeParametro, user.password);
    if (!validPassword) {
      throw new BadRequestException('Invalid credentials');
    }
    if (!user.isEmailConfirmed) {
      throw new BadRequestException('La cuenta no está confirmada');
    }
    //envio de token //* forma token
    const { password, ...payload } = user;

    const token = await this.jwtService.sign(payload);
    //Retornar mensaje de ingreso y token
    return {
      message: 'Logged user',
      token,
    };
  }

  async updateRole(id: string) {
    const userID = await this.usersRepository.findOneBy({ id });

    if (!userID) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    const newIsAdmin = !userID.isAdmin;
    const updateResult = await this.usersRepository.update(id, {
      isAdmin: newIsAdmin,
    });

    return `User with ID: ${id} have had his role updated.`;
  }
}
