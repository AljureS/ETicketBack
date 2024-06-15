import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(page: number, limit: number) {
    const start = (page - 1) * limit;
    const users = await this.userRepository.find({
      take: limit,
      skip: start,
    });

    return users.map(({ password, ...userNoPassword }) => userNoPassword);
  }

  async getUserById(id: string) {
    const userID = await this.userRepository.findOneBy({ id: id });
    if (!userID) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    } else {
      const { password, isAdmin, ...userNoPassword } = userID;
      return userNoPassword;
    }
  }

  async createUser(user: Partial<User>) {
    const newUser = await this.userRepository.save(user);
    const dbUser = await this.userRepository.findOneBy({ id: newUser.id });
    const { password, ...userNoPassword } = dbUser;
    // const {password, ...userNoPassword} = newUser
    return userNoPassword;
  }

  async updateUser(id: string, user: User) {
    // Recupera el usuario actualizado
    let userBuscado = await this.userRepository.findOneBy({ id });
    if (!userBuscado) {
      throw new NotFoundException(`No se encontró el usuario con ID ${id} `);
    }
    userBuscado = {
      ...userBuscado,
      ...user,
    };

    // Retorna el usuario sin incluir la contraseña
    const { password, ...userNoPassword } =
      await this.userRepository.save(userBuscado);
    return userNoPassword;
  }

  async deleteUser(id: string) {
    //?* const user = await this.usersRepository.findOneBy({id})
    //* user = await this.usersRepository.delete(user)
    const user = await this.userRepository.delete({ id });
    // const {password, ...userNoPassword} = user
    if (user.affected === 0) {
      //! => filas que fueron afectadas por el delete
      // Aquí puedes manejar el caso en que no se encontró el usuario para eliminar
      throw new Error('No se encontró el usuario con el ID proporcionado.');
    }
    return user;
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
}
