import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}

  public async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return bookmark;
  }

  public async getAllBookmarksByUserId(userId: number) {
    return await this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });
  }

  public async getBookmarkById(userId: number, bookmarkId: number) {
    return await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }

  public async updateBookmarkById(
    userId: number,
    id: number,
    dto: EditBookmarkDto,
  ) {
    try {
      const bookmark = await this.prismaService.bookmark.findUnique({
        where: {
          id,
        },
      });

      if (!bookmark) {
        throw new NotFoundException('Record not found');
      }

      if (bookmark.userId !== userId) {
        throw new ForbiddenException('Access resource denied');
      }

      const updatedBookmark = await this.prismaService.bookmark.update({
        data: {
          ...dto,
        },
        where: {
          id,
        },
      });
      return updatedBookmark;
    } catch (error) {
      throw error;
    }
  }

  public async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Record not found');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException('Access resource denied');
    }
    return await this.prismaService.bookmark.delete({
      where: {
        id: bookmarkId,
        userId,
      },
    });
  }
}
