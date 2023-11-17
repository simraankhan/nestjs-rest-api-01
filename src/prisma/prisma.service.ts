import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientOptions } from '@prisma/client/runtime/library';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    const config: PrismaClientOptions = {
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
    };
    super(config);
  }

  public cleanDBData() {
    return this.$transaction([
      this.bookmark.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
