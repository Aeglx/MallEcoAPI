import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { createCanvas, loadImage } from 'canvas';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CaptchaUtil {
  private readonly sliderImagesPath = path.join(__dirname, '../../assets/slider/images');
  
  /**
   * 生成数字验证码
   */
  generateNumericCaptcha(size = 4): { code: string; data: string } {
    const captcha = svgCaptcha.create({
      size,
      ignoreChars: '0o1iIl',
      noise: 2,
      color: true,
      background: '#f0f0f0',
    });
    
    return {
      code: captcha.text,
      data: captcha.data,
    };
  }

  /**
   * 生成数学表达式验证码
   */
  generateMathCaptcha(): { code: string; data: string } {
    const captcha = svgCaptcha.createMathExpr({
      mathMin: 1,
      mathMax: 20,
      mathOperator: '+',
      noise: 2,
      color: true,
      background: '#f0f0f0',
    });
    
    return {
      code: captcha.text,
      data: captcha.data,
    };
  }

  /**
   * 生成滑块验证码（使用Java版本的图片资源）
   */
  async generateSliderCaptcha(): Promise<{ 
    xPos: number; 
    yPos: number; 
    background: string; 
    slider: string;
    uuid: string;
    imageName: string;
  }> {
    // 随机选择一张背景图片
    const imageFiles = fs.readdirSync(this.sliderImagesPath).filter(file => file.endsWith('.jpg'));
    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(this.sliderImagesPath, randomImage);
    
    // 读取图片并转换为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // 生成随机位置（在图片范围内）
    const xPos = Math.floor(Math.random() * 200) + 50;
    const yPos = Math.floor(Math.random() * 100) + 50;
    
    // 生成唯一标识
    const uuid = this.generateUUID();
    
    // 生成滑块图片
    const sliderImage = await this.generateSliderImage(xPos, yPos);
    
    return {
      xPos,
      yPos,
      background: `data:image/jpeg;base64,${base64Image}`,
      slider: sliderImage,
      uuid,
      imageName: randomImage,
    };
  }

  /**
   * 验证滑块位置
   */
  verifySliderPosition(expectedX: number, actualX: number, tolerance = 5): boolean {
    return Math.abs(expectedX - actualX) <= tolerance;
  }

  /**
   * 生成滑块图片（使用canvas生成）
   */
  private async generateSliderImage(xPos: number, yPos: number): Promise<string> {
    // 创建canvas绘制滑块
    const canvas = createCanvas(50, 50);
    const ctx = canvas.getContext('2d');
    
    // 绘制滑块形状（圆形）
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    
    // 绘制圆形滑块
    ctx.beginPath();
    ctx.arc(25, 25, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // 添加内部指示器
    ctx.fillStyle = '#666666';
    ctx.beginPath();
    ctx.moveTo(25, 15);
    ctx.lineTo(20, 25);
    ctx.lineTo(30, 25);
    ctx.closePath();
    ctx.fill();
    
    // 转换为base64
    return canvas.toDataURL();
  }

  /**
   * 获取可用的滑块图片列表
   */
  getAvailableSliderImages(): string[] {
    try {
      const imageFiles = fs.readdirSync(this.sliderImagesPath).filter(file => file.endsWith('.jpg'));
      return imageFiles;
    } catch (error) {
      console.error('读取滑块图片目录失败:', error);
      return [];
    }
  }

  /**
   * 获取滑块图片数量
   */
  getSliderImageCount(): number {
    return this.getAvailableSliderImages().length;
  }

  /**
   * 生成UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}