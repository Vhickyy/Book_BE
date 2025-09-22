import { Test, TestingModule } from '@nestjs/testing';
import { AuthorBookService } from './author-book.service';

describe('AuthorBookService', () => {
  let service: AuthorBookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorBookService],
    }).compile();

    service = module.get<AuthorBookService>(AuthorBookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
