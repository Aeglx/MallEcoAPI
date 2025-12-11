import { 
  registerDecorator, 
  ValidationOptions, 
  ValidationArguments, 
  ValidatorConstraint, 
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isMobilePhone' })
export class IsMobilePhoneConstraint implements ValidatorConstraintInterface {
  validate(phone: any, args: ValidationArguments) {
    // 中国大陆手机号正则表达式
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  defaultMessage(args: ValidationArguments) {
    return '请输入有效的手机号码';
  }
}

export function IsMobilePhone(validationOptions?: ValidationOptions) {
  return registerDecorator({
    target: object.constructor.prototype,
    propertyName: propertyKey,
    options: validationOptions,
    constraints: [new IsMobilePhoneConstraint()],
    validator: {
      validate: (value: any) => {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(value);
      },
      defaultMessage: '请输入有效的手机号码',
    },
  });
}