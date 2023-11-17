import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Post()
  public createBookmark(@GetUser() user: User, @Body() dto: CreateBookmarkDto) {
    return this.bookmarkService.createBookmark(user.id, dto);
  }

  @Get('user')
  public getAllBookmarksByUserId(@GetUser() user: User) {
    return this.bookmarkService.getAllBookmarksByUserId(user.id);
  }

  @Get('bookmarkId/:id')
  public getBookmarkById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.getBookmarkById(user.id, id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  public updateBookmarkById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmarkById(user.id, id, dto);
  }

  @Delete('bookmarkId/:id')
  @HttpCode(HttpStatus.OK)
  public deleteBookmarkById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(user.id, id);
  }
}
