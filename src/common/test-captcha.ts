import { CaptchaUtil } from './utils/captcha.util';

async function testCaptcha() {
  const captchaUtil = new CaptchaUtil();
  
  console.log('=== 测试滑块验证码图片资源 ===');
  
  // 测试图片资源
  const imageCount = captchaUtil.getSliderImageCount();
  console.log(`可用的滑块图片数量: ${imageCount}`);
  
  const imageList = captchaUtil.getAvailableSliderImages();
  console.log('滑块图片列表:', imageList);
  
  // 测试滑块验证码生成
  console.log('\n=== 测试滑块验证码生成 ===');
  try {
    const sliderCaptcha = await captchaUtil.generateSliderCaptcha();
    console.log('滑块验证码生成成功:');
    console.log('- 图片名称:', sliderCaptcha.imageName);
    console.log('- X坐标:', sliderCaptcha.xPos);
    console.log('- Y坐标:', sliderCaptcha.yPos);
    console.log('- UUID:', sliderCaptcha.uuid);
    console.log('- 背景图片长度:', sliderCaptcha.background.length);
    console.log('- 滑块图片长度:', sliderCaptcha.slider.length);
    
    // 测试滑块验证
    console.log('\n=== 测试滑块验证 ===');
    const isValid = captchaUtil.verifySliderPosition(sliderCaptcha.xPos, sliderCaptcha.xPos + 2);
    console.log(`验证结果 (偏移2像素): ${isValid ? '通过' : '失败'}`);
    
    const isValid2 = captchaUtil.verifySliderPosition(sliderCaptcha.xPos, sliderCaptcha.xPos + 10);
    console.log(`验证结果 (偏移10像素): ${isValid2 ? '通过' : '失败'}`);
    
  } catch (error) {
    console.error('滑块验证码生成失败:', error);
  }
  
  // 测试数字验证码
  console.log('\n=== 测试数字验证码 ===');
  const numericCaptcha = captchaUtil.generateNumericCaptcha();
  console.log('数字验证码:', numericCaptcha.code);
  
  // 测试数学验证码
  console.log('\n=== 测试数学验证码 ===');
  const mathCaptcha = captchaUtil.generateMathCaptcha();
  console.log('数学验证码:', mathCaptcha.code);
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testCaptcha().catch(console.error);