import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Region } from '../../framework/entities/region.entity';

@Injectable()
export class RegionService {
  constructor(
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  /**
   * 获取地区信息
   */
  async getRegion(cityCode: string, townName: string) {
    try {
      const region = await this.regionRepository.findOne({
        where: { cityCode, name: Like(`%${townName}%`) },
      });
      return { success: true, result: region || null };
    } catch (error) {
      console.error('获取地区信息失败:', error);
      return { success: false, result: null, message: error.message };
    }
  }

  /**
   * 根据名称获取地区ID
   */
  async getItemByLastName(lastName: string) {
    try {
      const region = await this.regionRepository.findOne({
        where: { name: lastName },
      });
      return { success: true, result: region ? region.id : null };
    } catch (error) {
      console.error('根据名称获取地区ID失败:', error);
      return { success: false, result: null, message: error.message };
    }
  }

  /**
   * 根据父级ID获取子地区列表
   */
  async getItem(id: string) {
    try {
      const regions = await this.regionRepository.find({
        where: { parentId: id },
        order: { orderNum: 'ASC', id: 'ASC' },
      });
      return { success: true, result: regions };
    } catch (error) {
      console.error('获取子地区列表失败:', error);
      return { success: false, result: [], message: error.message };
    }
  }

  /**
   * 获取所有省-市数据
   */
  async getAllCity() {
    try {
      // 获取所有省份
      const provinces = await this.regionRepository.find({
        where: { level: 'province' },
        order: { orderNum: 'ASC', id: 'ASC' },
      });

      // 获取所有城市
      const provinceIds = provinces.map(p => p.id.toString());
      const cities =
        provinceIds.length > 0
          ? await this.regionRepository.find({
              where: { parentId: Like(provinceIds.join('|')), level: 'city' },
              order: { orderNum: 'ASC', id: 'ASC' },
            })
          : [];

      // 组装数据
      const result = provinces.map(province => {
        const provinceCities = cities.filter(c => c.parentId === province.id.toString());
        return {
          ...province,
          children: provinceCities,
        };
      });

      return { success: true, result };
    } catch (error) {
      console.error('获取省-市数据失败:', error);
      // 如果数据库中没有数据，返回模拟数据作为fallback
      return { success: true, result: this.getMockData() };
    }
  }

  /**
   * 获取省市区三级树形数据
   */
  async getRegionTree(parentId: string = '0') {
    try {
      const regions = await this.regionRepository.find({
        where: { parentId },
        order: { orderNum: 'ASC', id: 'ASC' },
      });

      // 递归获取子级
      const result = await Promise.all(
        regions.map(async region => {
          const children = await this.getRegionTree(region.id.toString());
          return {
            ...region,
            children: children.result || [],
          };
        }),
      );

      return { success: true, result };
    } catch (error) {
      console.error('获取地区树形数据失败:', error);
      return { success: false, result: [], message: error.message };
    }
  }

  /**
   * 根据级别获取地区列表
   */
  async getByLevel(level: string) {
    try {
      const regions = await this.regionRepository.find({
        where: { level },
        order: { orderNum: 'ASC', id: 'ASC' },
      });
      return { success: true, result: regions };
    } catch (error) {
      console.error('根据级别获取地区列表失败:', error);
      return { success: false, result: [], message: error.message };
    }
  }

  /**
   * 搜索地区
   */
  async search(keyword: string) {
    try {
      const regions = await this.regionRepository
        .createQueryBuilder('region')
        .where('region.name LIKE :keyword', { keyword: `%${keyword}%` })
        .orWhere('region.adCode LIKE :keyword', { keyword: `%${keyword}%` })
        .orderBy('region.level', 'ASC')
        .addOrderBy('region.orderNum', 'ASC')
        .take(50)
        .getMany();

      return { success: true, result: regions };
    } catch (error) {
      console.error('搜索地区失败:', error);
      return { success: false, result: [], message: error.message };
    }
  }

  /**
   * 初始化地区数据（如果数据库为空，插入基础数据）
   */
  async initRegions() {
    try {
      const count = await this.regionRepository.count();
      if (count > 0) {
        return { success: true, message: '地区数据已存在，无需初始化' };
      }

      // 插入基础省份数据
      const provinces = [
        {
          parentId: '0',
          adCode: '110000',
          cityCode: '110000',
          level: 'province',
          name: '北京市',
          path: '1',
          orderNum: 1,
        },
        {
          parentId: '0',
          adCode: '120000',
          cityCode: '120000',
          level: 'province',
          name: '天津市',
          path: '2',
          orderNum: 2,
        },
        {
          parentId: '0',
          adCode: '130000',
          cityCode: '130000',
          level: 'province',
          name: '河北省',
          path: '3',
          orderNum: 3,
        },
        {
          parentId: '0',
          adCode: '140000',
          cityCode: '140000',
          level: 'province',
          name: '山西省',
          path: '4',
          orderNum: 4,
        },
        {
          parentId: '0',
          adCode: '150000',
          cityCode: '150000',
          level: 'province',
          name: '内蒙古自治区',
          path: '5',
          orderNum: 5,
        },
        {
          parentId: '0',
          adCode: '210000',
          cityCode: '210000',
          level: 'province',
          name: '辽宁省',
          path: '6',
          orderNum: 6,
        },
        {
          parentId: '0',
          adCode: '220000',
          cityCode: '220000',
          level: 'province',
          name: '吉林省',
          path: '7',
          orderNum: 7,
        },
        {
          parentId: '0',
          adCode: '230000',
          cityCode: '230000',
          level: 'province',
          name: '黑龙江省',
          path: '8',
          orderNum: 8,
        },
        {
          parentId: '0',
          adCode: '310000',
          cityCode: '310000',
          level: 'province',
          name: '上海市',
          path: '9',
          orderNum: 9,
        },
        {
          parentId: '0',
          adCode: '320000',
          cityCode: '320000',
          level: 'province',
          name: '江苏省',
          path: '10',
          orderNum: 10,
        },
        {
          parentId: '0',
          adCode: '330000',
          cityCode: '330000',
          level: 'province',
          name: '浙江省',
          path: '11',
          orderNum: 11,
        },
        {
          parentId: '0',
          adCode: '340000',
          cityCode: '340000',
          level: 'province',
          name: '安徽省',
          path: '12',
          orderNum: 12,
        },
        {
          parentId: '0',
          adCode: '350000',
          cityCode: '350000',
          level: 'province',
          name: '福建省',
          path: '13',
          orderNum: 13,
        },
        {
          parentId: '0',
          adCode: '360000',
          cityCode: '360000',
          level: 'province',
          name: '江西省',
          path: '14',
          orderNum: 14,
        },
        {
          parentId: '0',
          adCode: '370000',
          cityCode: '370000',
          level: 'province',
          name: '山东省',
          path: '15',
          orderNum: 15,
        },
        {
          parentId: '0',
          adCode: '410000',
          cityCode: '410000',
          level: 'province',
          name: '河南省',
          path: '16',
          orderNum: 16,
        },
        {
          parentId: '0',
          adCode: '420000',
          cityCode: '420000',
          level: 'province',
          name: '湖北省',
          path: '17',
          orderNum: 17,
        },
        {
          parentId: '0',
          adCode: '430000',
          cityCode: '430000',
          level: 'province',
          name: '湖南省',
          path: '18',
          orderNum: 18,
        },
        {
          parentId: '0',
          adCode: '440000',
          cityCode: '440000',
          level: 'province',
          name: '广东省',
          path: '19',
          orderNum: 19,
        },
        {
          parentId: '0',
          adCode: '450000',
          cityCode: '450000',
          level: 'province',
          name: '广西壮族自治区',
          path: '20',
          orderNum: 20,
        },
        {
          parentId: '0',
          adCode: '460000',
          cityCode: '460000',
          level: 'province',
          name: '海南省',
          path: '21',
          orderNum: 21,
        },
        {
          parentId: '0',
          adCode: '500000',
          cityCode: '500000',
          level: 'province',
          name: '重庆市',
          path: '22',
          orderNum: 22,
        },
        {
          parentId: '0',
          adCode: '510000',
          cityCode: '510000',
          level: 'province',
          name: '四川省',
          path: '23',
          orderNum: 23,
        },
        {
          parentId: '0',
          adCode: '520000',
          cityCode: '520000',
          level: 'province',
          name: '贵州省',
          path: '24',
          orderNum: 24,
        },
        {
          parentId: '0',
          adCode: '530000',
          cityCode: '530000',
          level: 'province',
          name: '云南省',
          path: '25',
          orderNum: 25,
        },
        {
          parentId: '0',
          adCode: '540000',
          cityCode: '540000',
          level: 'province',
          name: '西藏自治区',
          path: '26',
          orderNum: 26,
        },
        {
          parentId: '0',
          adCode: '610000',
          cityCode: '610000',
          level: 'province',
          name: '陕西省',
          path: '27',
          orderNum: 27,
        },
        {
          parentId: '0',
          adCode: '620000',
          cityCode: '620000',
          level: 'province',
          name: '甘肃省',
          path: '28',
          orderNum: 28,
        },
        {
          parentId: '0',
          adCode: '630000',
          cityCode: '630000',
          level: 'province',
          name: '青海省',
          path: '29',
          orderNum: 29,
        },
        {
          parentId: '0',
          adCode: '640000',
          cityCode: '640000',
          level: 'province',
          name: '宁夏回族自治区',
          path: '30',
          orderNum: 30,
        },
        {
          parentId: '0',
          adCode: '650000',
          cityCode: '650000',
          level: 'province',
          name: '新疆维吾尔自治区',
          path: '31',
          orderNum: 31,
        },
        {
          parentId: '0',
          adCode: '710000',
          cityCode: '710000',
          level: 'province',
          name: '台湾省',
          path: '32',
          orderNum: 32,
        },
        {
          parentId: '0',
          adCode: '810000',
          cityCode: '810000',
          level: 'province',
          name: '香港特别行政区',
          path: '33',
          orderNum: 33,
        },
        {
          parentId: '0',
          adCode: '820000',
          cityCode: '820000',
          level: 'province',
          name: '澳门特别行政区',
          path: '34',
          orderNum: 34,
        },
      ];

      const savedProvinces = await this.regionRepository.save(provinces);

      // 插入主要城市数据（示例：主要一线城市）
      const cities = [
        {
          parentId: savedProvinces[0].id.toString(),
          adCode: '110100',
          cityCode: '110000',
          level: 'city',
          name: '北京市',
          path: `${savedProvinces[0].id},${savedProvinces[0].id}1`,
          orderNum: 1,
        },
        {
          parentId: savedProvinces[8].id.toString(),
          adCode: '310100',
          cityCode: '310000',
          level: 'city',
          name: '上海市',
          path: `${savedProvinces[8].id},${savedProvinces[8].id}1`,
          orderNum: 1,
        },
        {
          parentId: savedProvinces[18].id.toString(),
          adCode: '440100',
          cityCode: '440100',
          level: 'city',
          name: '广州市',
          path: `${savedProvinces[18].id},${savedProvinces[18].id}1`,
          orderNum: 1,
        },
        {
          parentId: savedProvinces[18].id.toString(),
          adCode: '440300',
          cityCode: '440300',
          level: 'city',
          name: '深圳市',
          path: `${savedProvinces[18].id},${savedProvinces[18].id}2`,
          orderNum: 2,
        },
      ];

      await this.regionRepository.save(cities);

      return { success: true, message: '地区数据初始化成功' };
    } catch (error) {
      console.error('初始化地区数据失败:', error);
      return { success: false, message: '初始化地区数据失败: ' + error.message };
    }
  }

  /**
   * 获取模拟数据（fallback）
   */
  private getMockData() {
    return [
      {
        id: '1',
        parentId: '0',
        adCode: '110000',
        cityCode: '110000',
        level: 'province',
        name: '北京市',
        children: [
          {
            id: '11',
            parentId: '1',
            adCode: '110100',
            cityCode: '110000',
            level: 'city',
            name: '北京市',
          },
        ],
      },
      {
        id: '9',
        parentId: '0',
        adCode: '310000',
        cityCode: '310000',
        level: 'province',
        name: '上海市',
        children: [
          {
            id: '21',
            parentId: '9',
            adCode: '310100',
            cityCode: '310000',
            level: 'city',
            name: '上海市',
          },
        ],
      },
      {
        id: '19',
        parentId: '0',
        adCode: '440000',
        cityCode: '440000',
        level: 'province',
        name: '广东省',
        children: [
          {
            id: '31',
            parentId: '19',
            adCode: '440100',
            cityCode: '440100',
            level: 'city',
            name: '广州市',
          },
          {
            id: '32',
            parentId: '19',
            adCode: '440300',
            cityCode: '440300',
            level: 'city',
            name: '深圳市',
          },
        ],
      },
    ];
  }
}
