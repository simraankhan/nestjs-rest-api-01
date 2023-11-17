import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  public getUser(@GetUser() user: User) {
    return user;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  public updateUserById(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateUserById(user.id, updateUserDto);
  }
}
