import { Module } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';
import { TypeOrmModule } from '../../node_modules/@nestjs/typeorm';
import { Favorite } from '../entity/Favorite';
import { Question } from '../entity/Question';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, Question])],
  controllers: [FavoriteController],
  providers: [FavoriteService],
})
export class FavoriteModule {}
