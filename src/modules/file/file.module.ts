import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallFile } from './entities/file.entity';
import { FileDirectory as MallFileDirectory } from './entities/file-directory.entity';
import { FileController } from './controllers/file.controller';
import { FileService } from './services/file.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([MallFile, MallFileDirectory]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'public', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}