import { Module } from '@nestjs/common';
import { AuthorBookService } from './author-book.service';
import { AuthorBookController } from './author-book.controller';

@Module({
  providers: [AuthorBookService],
  controllers: [AuthorBookController],
})
export class AuthorBookModule {}
