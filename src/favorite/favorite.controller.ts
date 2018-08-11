import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { User } from '../shared/decorators/user';
import { WxUserDto } from '../auth/auth.dto';
import { FavoriteService } from './favorite.service';

@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}
  @Post()
  addFavorite(@Body('question') questionId: number, @User() user: WxUserDto) {
    return this.favoriteService.saveNewFavoriteById(questionId, user.uuid);
  }

  @Get()
  getFavorite(@User() user: WxUserDto) {
    return this.favoriteService.getFavoriteByUserId(user.uuid);
  }

  @Delete()
  deleteFavorite(@Param('id') questionId: number, @User() user: WxUserDto) {
    return this.favoriteService.deleteFavoriteById(questionId, user.uuid);
  }
}
