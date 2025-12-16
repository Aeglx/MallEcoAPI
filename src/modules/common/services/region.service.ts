import { Injectable } from '@nestjs/common';

@Injectable()
export class RegionService {
  // 模拟地区数据
  private regions = [
    { id: '1', parentId: '0', adCode: '110000', cityCode: '110000', center: '116.407526,39.904030', level: 'province', name: '北京市', path: '1', orderNum: 1 },
    { id: '2', parentId: '0', adCode: '310000', cityCode: '310000', center: '121.472644,31.231706', level: 'province', name: '上海市', path: '2', orderNum: 2 },
    { id: '3', parentId: '0', adCode: '440000', cityCode: '440000', center: '113.280637,23.125178', level: 'province', name: '广东省', path: '3', orderNum: 3 },
    { id: '11', parentId: '1', adCode: '110100', cityCode: '110000', center: '116.407526,39.904030', level: 'city', name: '北京市', path: '1,11', orderNum: 1 },
    { id: '21', parentId: '2', adCode: '310100', cityCode: '310000', center: '121.472644,31.231706', level: 'city', name: '上海市', path: '2,21', orderNum: 1 },
    { id: '31', parentId: '3', adCode: '440100', cityCode: '440100', center: '113.280637,23.125178', level: 'city', name: '广州市', path: '3,31', orderNum: 1 },
    { id: '32', parentId: '3', adCode: '440300', cityCode: '440300', center: '114.057868,22.543099', level: 'city', name: '深圳市', path: '3,32', orderNum: 2 },
    { id: '111', parentId: '11', adCode: '110101', cityCode: '110000', center: '116.368324,39.915309', level: 'district', name: '东城区', path: '1,11,111', orderNum: 1 },
    { id: '112', parentId: '11', adCode: '110102', cityCode: '110000', center: '116.351491,39.866135', level: 'district', name: '西城区', path: '1,11,112', orderNum: 2 },
    { id: '211', parentId: '21', adCode: '310101', cityCode: '310000', center: '121.481809,31.235923', level: 'district', name: '黄浦区', path: '2,21,211', orderNum: 1 },
    { id: '212', parentId: '21', adCode: '310104', cityCode: '310000', center: '121.475070,31.213130', level: 'district', name: '徐汇区', path: '2,21,212', orderNum: 2 },
    { id: '311', parentId: '31', adCode: '440103', cityCode: '440100', center: '113.264385,23.129110', level: 'district', name: '荔湾区', path: '3,31,311', orderNum: 1 },
    { id: '312', parentId: '31', adCode: '440104', cityCode: '440100', center: '113.288188,23.125410', level: 'district', name: '越秀区', path: '3,31,312', orderNum: 2 },
    { id: '321', parentId: '32', adCode: '440303', cityCode: '440300', center: '114.062903,22.546054', level: 'district', name: '罗湖区', path: '3,32,321', orderNum: 1 },
    { id: '322', parentId: '32', adCode: '440304', cityCode: '440300', center: '114.001498,22.534886', level: 'district', name: '福田区', path: '3,32,322', orderNum: 2 }
  ];

  getRegion(cityCode: string, townName: string) {
    // 模拟点地图获取地址信息
    const region = this.regions.find(r => r.cityCode === cityCode && r.name.includes(townName));
    return region || null;
  }

  getItemByLastName(lastName: string) {
    // 模拟根据名字获取地区地址id
    const region = this.regions.find(r => r.name === lastName);
    return region ? region.id : null;
  }

  getItem(id: string) {
    // 模拟通过id获取子地区
    return this.regions.filter(r => r.parentId === id);
  }

  getAllCity() {
    // 模拟获取所有的省-市
    const provinces = this.regions.filter(r => r.level === 'province');
    return provinces.map(province => {
      const cities = this.regions.filter(r => r.parentId === province.id && r.level === 'city');
      return {
        ...province,
        children: cities
      };
    });
  }
}