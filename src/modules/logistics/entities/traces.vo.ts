import { ApiProperty } from '@nestjs/swagger';

export class Trace {
  @ApiProperty({ description: '时间' })
  acceptTime: string;

  @ApiProperty({ description: '描述' })
  acceptStation: string;
}

export class Traces {
  @ApiProperty({ description: '物流公司名称' })
  shipperName: string;

  @ApiProperty({ description: '物流单号' })
  logisticCode: string;

  @ApiProperty({
    description: '快递状态：0在途中，1已揽收，2疑难，3已签收，4退签，5同城派送中，6退回',
  })
  state: string;

  @ApiProperty({ description: '物流轨迹' })
  traces: Trace[];
}
