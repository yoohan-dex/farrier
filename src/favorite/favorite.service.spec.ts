import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';

describe('FavoriteService', () => {
  let service: FavoriteService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavoriteService],
    }).compile();
    service = module.get<FavoriteService>(FavoriteService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
