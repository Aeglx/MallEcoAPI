/**
 * 验证码资源DTO
 */
export class VerificationSourceDto {
  /** 资源ID */
  id?: string;
  /** 资源路径 */
  resource: string;
  /** 资源类型 */
  type: string;
}

/**
 * 验证码配置DTO
 */
export class VerificationDto {
  /** 验证码资源列表 */
  verificationResources: VerificationSourceDto[];
  /** 滑块资源列表 */
  verificationSlider: VerificationSourceDto[];
}

/**
 * 滑块验证响应DTO
 */
export class SliderCaptchaResponseDto {
  /** 滑块图片（base64） */
  slidingImage: string;
  /** 背景图片（base64） */
  backImage: string;
  /** X轴位置 */
  randomX: number;
  /** Y轴位置 */
  randomY: number;
  /** 原始高度 */
  originalHeight: number;
  /** 原始宽度 */
  originalWidth: number;
  /** 滑块高度 */
  sliderHeight: number;
  /** 滑块宽度 */
  sliderWidth: number;
  /** 验证key */
  key?: string;
  /** 有效时间（秒） */
  effectiveTime?: number;
}
