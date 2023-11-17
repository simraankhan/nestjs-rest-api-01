import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const port = 5000;
  const baseUrl = `http://localhost:${port}`;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(port);
    prisma = app.get(PrismaService);
    await prisma.cleanDBData();
    pactum.request.setBaseUrl(baseUrl);
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: '12345',
    };
    describe('register', () => {
      it('Should throws exception if body empty', () => {
        return pactum.spec().post(`/auth/register`).expectStatus(400);
      });

      it('Should throws exception if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throws exception if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throws exception if email invalid', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'test',
          })
          .expectStatus(400);
      });

      it('Should Register', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('login', () => {
      it('should login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get User', () => {
      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/user/')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('Should edit user by userId', () => {
        const payload: UpdateUserDto = {
          email: 'test-updat@gmail.com',
          firstName: 'John',
          lastName: 'Smith',
        };
        return pactum
          .spec()
          .put('/user/')
          .withBody(payload)
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmark/user')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Bookmark', () => {
      it('Should create bookmark', () => {
        const payload: CreateBookmarkDto = {
          link: 'www.test.com',
          title: 'Test title',
          description: 'Test description',
        };
        return pactum
          .spec()
          .post('/bookmark/')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(payload)
          .expectStatus(201)
          .expectBodyContains(payload.link)
          .expectBodyContains(payload.title)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmarks by userId', () => {
      it('Should get bookmarks by userId', () => {
        return pactum
          .spec()
          .get('/bookmark/user')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark By Id', () => {
      it('Should get bookmark by Id', () => {
        return pactum
          .spec()
          .get('/bookmark/bookmarkId/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit Bookmark', () => {
      it('Should edit bookmark by Id', () => {
        const payload: EditBookmarkDto = {
          description: 'Test description update',
          link: 'https://www.youtube.com/watch?v=W1gvIw0GNl8&ab_channel=AnsontheDeveloper',
          title: 'Test title update',
        };
        return pactum
          .spec()
          .put('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(payload)
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(payload.description)
          .expectBodyContains(payload.title);
      });
    });

    describe('Delete bookmark by Id', () => {
      it('Should delete bookmark by Id', () => {
        return pactum
          .spec()
          .delete('/bookmark/bookmarkId/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Throw exception if bookmark not found when edit', () => {
      it('Should throw exception', () => {
        const payload: EditBookmarkDto = {
          description: 'Test description update',
          link: 'https://www.youtube.com/watch?v=W1gvIw0GNl8&ab_channel=AnsontheDeveloper',
          title: 'Test title update',
        };
        return pactum
          .spec()
          .put('/bookmark/{id}')
          .withPathParams('id', '0')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(payload)
          .expectStatus(404);
      });
    });

    describe('Throw exception if different user edit the record', () => {
      it('Should throw exception', () => {
        const payload: EditBookmarkDto = {
          description: 'Test description update',
          link: 'https://www.youtube.com/watch?v=W1gvIw0GNl8&ab_channel=AnsontheDeveloper',
          title: 'Test title update',
        };
        const token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoidGVzdEBnbWFpbC5jb20iLCJpYXQiOjE3MDAyMjU3MzEsImV4cCI6MTcwMDIyNjYzMX0.4Qlas3lf9aYmUeXv5V8wZGp6N-Zypm643_IykZQs3Fc';
        return pactum
          .spec()
          .put('/bookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer ' + token,
          })
          .withBody(payload)
          .expectStatus(401)
          .inspect();
      });
    });
  });
});
