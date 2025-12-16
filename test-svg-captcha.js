const svgCaptcha = require('svg-captcha');

// 生成普通验证码
const captcha = svgCaptcha.create();
console.log('普通验证码:');
console.log('text:', captcha.text);
console.log('data:', captcha.data.substring(0, 100) + '...');

// 生成数字验证码
const numericCaptcha = svgCaptcha.create({ size: 4, ignoreChars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', noise: 2, color: true, background: '#cc9966' });
console.log('\n数字验证码:');
console.log('text:', numericCaptcha.text);
console.log('data:', numericCaptcha.data.substring(0, 100) + '...');

// 生成字符验证码
const charCaptcha = svgCaptcha.create({ size: 4, noise: 3, color: true });
console.log('\n字符验证码:');
console.log('text:', charCaptcha.text);
console.log('data:', charCaptcha.data.substring(0, 100) + '...');

// 生成算术验证码
const mathCaptcha = svgCaptcha.createMathExpr({ size: 4, noise: 3, color: true });
console.log('\n算术验证码:');
console.log('text:', mathCaptcha.text);
console.log('data:', mathCaptcha.data.substring(0, 100) + '...');
console.log('text (解答):', mathCaptcha.text.split('=')[0] + '= ' + mathCaptcha.text.split('=')[1]);
