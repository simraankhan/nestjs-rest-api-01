import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prismaService: PrismaService) {}

  public async updateUserById(userId: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          ...updateUserDto,
        },
      });
      delete user.password;

      return user;
    } catch (error) {
      throw error;
    }
  }
}
