import { Injectable } from '@nestjs/common';
import { InjectRepository } from '../../node_modules/@nestjs/typeorm';
import { Favorite } from '../entity/Favorite';
import { Repository } from '../../node_modules/typeorm';
import { Question } from '../entity/Question';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}
  async saveNewFavoriteById(id: number, userId: string) {
    const favorite = await this.favoriteRepository.findOne({ userId });
    const question = await this.questionRepository.findOne(id);

    favorite.questions.push(question);
    return await this.favoriteRepository.save(favorite);
  }
  async deleteFavoriteById(id: number, userId: string) {
    const favorite = await this.favoriteRepository.findOne({ userId });
    favorite.questions = favorite.questions.filter(q => q.id !== id);
    return await this.favoriteRepository.save(favorite);
  }

  async getFavoriteByUserId(userId: string) {
    return await this.favoriteRepository.findOne({ userId });
  }
}
