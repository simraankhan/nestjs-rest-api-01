import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  public async register(authDto: AuthDto) {
    try {
      const hashPassword = await argon.hash(authDto.password);
      const user = await this.prismaService.user.create({
        data: {
          email: authDto.email,
          password: hashPassword,
        },
      });
      delete user.password;
      return user;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('Credential taken');
      }
      throw error;
    }
  }

  public async login(authDto: AuthDto) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          email: authDto.email,
        },
      });
      if (!user) throw new ForbiddenException('User not found');

      const isPasswordMatch = await argon.verify(
        user.password,
        authDto.password,
      );
      if (!isPasswordMatch) throw new ForbiddenException('Password not match');

      return this.signToken(user.id, user.email);
    } catch (error) {
      throw error;
    }
  }

  private async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}
