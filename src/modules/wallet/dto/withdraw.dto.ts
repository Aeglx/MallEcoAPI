import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({
    description: '提现金额',
    example: 50.0,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: '银行账号',
    example: '6228480000000000000',
  })
  @IsNotEmpty()
  bankAccount: string;

  @ApiProperty({
    description: '银行名称',
    example: '中国工商银行',
  })
  @IsNotEmpty()
  bankName: string;

  @ApiProperty({
    description: '账户姓名',
    example: '张三',
  })
  @IsNotEmpty()
  accountName: string;
}
