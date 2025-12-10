import { MigrationInterface, QueryRunner, Table, Index } from 'typeorm';

export class CreateDistributionTables1735612000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建分销员表
    await queryRunner.createTable(
      new Table({
        name: 'li_distribution',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'member_id',
            type: 'varchar',
            length: '36',
            comment: '会员ID',
          },
          {
            name: 'member_name',
            type: 'varchar',
            length: '100',
            comment: '会员名称',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '会员姓名',
          },
          {
            name: 'id_number',
            type: 'varchar',
            length: '18',
            isNullable: true,
            comment: '身份证号',
          },
          {
            name: 'rebate_total',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: '分销总额',
          },
          {
            name: 'can_rebate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: '可提现金额',
          },
          {
            name: 'commission_frozen',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: '冻结金额',
          },
          {
            name: 'distribution_order_count',
            type: 'int',
            default: 0,
            comment: '分销订单数',
          },
          {
            name: 'distribution_status',
            type: 'enum',
            enum: ['APPLY', 'PASS', 'REFUSE', 'DISABLE'],
            default: '"APPLY"',
            comment: '分销员状态',
          },
          {
            name: 'settlement_bank_account_name',
            type: 'varchar',
            length: '200',
            comment: '结算银行开户行名称',
          },
          {
            name: 'settlement_bank_account_num',
            type: 'varchar',
            length: '200',
            comment: '结算银行开户账号',
          },
          {
            name: 'settlement_bank_branch_name',
            type: 'varchar',
            length: '200',
            comment: '结算银行开户支行名称',
          },
          {
            name: 'distribution_order_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: '分销订单金额',
          },
          {
            name: 'create_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
          {
            name: 'update_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            comment: '更新时间',
          },
          {
            name: 'create_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '创建者',
          },
          {
            name: 'update_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '更新者',
          },
          {
            name: 'delete_flag',
            type: 'boolean',
            default: false,
            comment: '删除标志',
          },
        ],
      }),
      true,
    );

    // 创建分销商品表
    await queryRunner.createTable(
      new Table({
        name: 'li_distribution_goods',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'goods_id',
            type: 'varchar',
            length: '36',
            comment: '商品ID',
          },
          {
            name: 'goods_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '商品名称',
          },
          {
            name: 'sku_id',
            type: 'varchar',
            length: '36',
            comment: '规格ID',
          },
          {
            name: 'specs',
            type: 'text',
            isNullable: true,
            select: false,
            comment: '规格信息json',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
            comment: '店铺ID',
          },
          {
            name: 'store_name',
            type: 'varchar',
            length: '100',
            comment: '店铺名称',
          },
          {
            name: 'commission',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: '佣金金额',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: '商品价格',
          },
          {
            name: 'thumbnail',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '缩略图路径',
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: true,
            comment: '库存',
          },
          {
            name: 'create_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
          {
            name: 'create_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '创建者',
          },
          {
            name: 'delete_flag',
            type: 'boolean',
            default: false,
            comment: '删除标志',
          },
        ],
      }),
      true,
    );

    // 创建分销订单表
    await queryRunner.createTable(
      new Table({
        name: 'li_distribution_order',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'create_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
          {
            name: 'distribution_order_status',
            type: 'enum',
            enum: ['NO_COMPLETED', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
            default: '"NO_COMPLETED"',
            comment: '分销订单状态',
          },
          {
            name: 'member_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '购买会员的id',
          },
          {
            name: 'member_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '购买会员的名称',
          },
          {
            name: 'distribution_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '分销员id',
          },
          {
            name: 'distribution_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '分销员名称',
          },
          {
            name: 'settle_cycle',
            type: 'datetime',
            isNullable: true,
            comment: '解冻日期',
          },
          {
            name: 'rebate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
            comment: '提成金额',
          },
          {
            name: 'sell_back_rebate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            comment: '退款金额',
          },
          {
            name: 'store_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '店铺id',
          },
          {
            name: 'store_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '店铺名称',
          },
          {
            name: 'order_sn',
            type: 'varchar',
            length: '64',
            isNullable: true,
            comment: '订单编号',
          },
          {
            name: 'order_item_sn',
            type: 'varchar',
            length: '64',
            isNullable: true,
            comment: '子订单编号',
          },
          {
            name: 'goods_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '商品ID',
          },
          {
            name: 'goods_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '商品名称',
          },
          {
            name: 'sku_id',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '货品ID',
          },
          {
            name: 'specs',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '规格',
          },
          {
            name: 'image',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '图片',
          },
          {
            name: 'num',
            type: 'int',
            isNullable: true,
            comment: '商品数量',
          },
          {
            name: 'refund_num',
            type: 'int',
            default: 0,
            comment: '退款商品数量',
          },
          {
            name: 'delete_flag',
            type: 'boolean',
            default: false,
            comment: '删除标志',
          },
        ],
      }),
      true,
    );

    // 创建分销提现表
    await queryRunner.createTable(
      new Table({
        name: 'li_distribution_cash',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'distribution_id',
            type: 'varchar',
            length: '36',
            comment: '分销员ID',
          },
          {
            name: 'distribution_name',
            type: 'varchar',
            length: '100',
            comment: '分销员名称',
          },
          {
            name: 'cash_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            comment: '提现金额',
          },
          {
            name: 'cash_serial_no',
            type: 'varchar',
            length: '64',
            isUnique: true,
            comment: '提现流水号',
          },
          {
            name: 'bank_account_name',
            type: 'varchar',
            length: '100',
            comment: '银行开户名',
          },
          {
            name: 'bank_account_num',
            type: 'varchar',
            length: '200',
            comment: '银行账号',
          },
          {
            name: 'bank_branch_name',
            type: 'varchar',
            length: '200',
            comment: '开户支行名称',
          },
          {
            name: 'cash_status',
            type: 'enum',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
            default: '"PENDING"',
            comment: '提现状态',
          },
          {
            name: 'audit_remark',
            type: 'text',
            isNullable: true,
            comment: '审核备注',
          },
          {
            name: 'audit_time',
            type: 'datetime',
            isNullable: true,
            comment: '审核时间',
          },
          {
            name: 'audit_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '审核人',
          },
          {
            name: 'create_time',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
          {
            name: 'create_by',
            type: 'varchar',
            length: '36',
            isNullable: true,
            comment: '创建者',
          },
          {
            name: 'delete_flag',
            type: 'boolean',
            default: false,
            comment: '删除标志',
          },
        ],
      }),
      true,
    );

    // 创建索引
    await queryRunner.createIndex(
      'li_distribution',
      new Index('IDX_MEMBER_ID', ['member_id']),
    );

    await queryRunner.createIndex(
      'li_distribution',
      new Index('IDX_DISTRIBUTION_STATUS', ['distribution_status']),
    );

    await queryRunner.createIndex(
      'li_distribution_goods',
      new Index('IDX_SKU_ID', ['sku_id']),
    );

    await queryRunner.createIndex(
      'li_distribution_goods',
      new Index('IDX_STORE_ID', ['store_id']),
    );

    await queryRunner.createIndex(
      'li_distribution_order',
      new Index('IDX_DISTRIBUTION_ID_ORDER', ['distribution_id']),
    );

    await queryRunner.createIndex(
      'li_distribution_order',
      new Index('IDX_ORDER_SN', ['order_sn']),
    );

    await queryRunner.createIndex(
      'li_distribution_order',
      new Index('IDX_MEMBER_ID_ORDER', ['member_id']),
    );

    await queryRunner.createIndex(
      'li_distribution_cash',
      new Index('IDX_DISTRIBUTION_ID_CASH', ['distribution_id']),
    );

    await queryRunner.createIndex(
      'li_distribution_cash',
      new Index('IDX_CASH_SERIAL_NO', ['cash_serial_no']),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('li_distribution_cash');
    await queryRunner.dropTable('li_distribution_order');
    await queryRunner.dropTable('li_distribution_goods');
    await queryRunner.dropTable('li_distribution');
  }
}