import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from './favorite.controller';

describe('Favorite Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [FavoriteController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: FavoriteController = module.get<FavoriteController>(FavoriteController);
    expect(controller).toBeDefined();
  });
});
