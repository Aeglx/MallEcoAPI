import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('promotions')
@UseGuards(JwtAuthGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  create(@Body() createPromotionDto: CreatePromotionDto) {
    return this.promotionService.create(createPromotionDto);
  }

  @Get()
  findAll() {
    return this.promotionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: UpdatePromotionDto) {
    return this.promotionService.update(id, updatePromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }

  @Patch(':id/pause')
  pausePromotion(@Param('id') id: string) {
    return this.promotionService.pausePromotion(id);
  }

  @Patch(':id/resume')
  resumePromotion(@Param('id') id: string) {
    return this.promotionService.resumePromotion(id);
  }

  @Get('product/:productId')
  findByProductId(@Param('productId') productId: string, @Body('promotionType') promotionType?: number) {
    return this.promotionService.findByProductId(productId, promotionType);
  }

  @Get('type/:promotionType')
  findByType(@Param('promotionType') promotionType: number) {
    return this.promotionService.findByType(promotionType);
  }
}
