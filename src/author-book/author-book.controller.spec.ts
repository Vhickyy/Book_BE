import { Test, TestingModule } from '@nestjs/testing';
import { AuthorBookController } from './author-book.controller';

describe('AuthorBookController', () => {
  let controller: AuthorBookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorBookController],
    }).compile();

    controller = module.get<AuthorBookController>(AuthorBookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
