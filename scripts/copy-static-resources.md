# 静态资源迁移说明

## 需要从Java版复制的静态资源

### 1. 轮播图资源
**源路径**: `MallEcoJava/common-api/src/main/resources/slider/`
**目标路径**: `MallEcoAPI/public/slider/`

需要复制的文件：
- `slider/images/` 目录下的所有图片文件 (1.jpg 到 23.jpg)
- `slider/slider/` 目录下的所有PNG文件 (1-w.png 到 6-w.png)

### 2. 验证文件
**源路径**: `MallEcoJava/buyer-api/src/main/resources/static/`
**目标路径**: `MallEcoAPI/public/static/`

需要复制的文件：
- `MP_verify_qSyvBPhDsPdxvOhC.txt`

### 3. 其他资源文件
**源路径**: `MallEcoJava/framework/src/main/resources/`
**目标路径**: `MallEcoAPI/public/resources/`

需要复制的文件：
- `maven-repository/SF-CSIM-EXPRESS-SDK-V2.1.7.jar`
- `script/limit.lua`
- `script/quantity.lua`

## 复制命令示例

### Windows 命令
```cmd
# 复制轮播图资源
xcopy "d:\malleco\MallEcoJava\common-api\src\main\resources\slider" "d:\malleco\MallEcoAPI\public\slider" /E /I

# 复制验证文件
xcopy "d:\malleco\MallEcoJava\buyer-api\src\main\resources\static" "d:\malleco\MallEcoAPI\public\static" /E /I

# 复制框架资源
xcopy "d:\malleco\MallEcoJava\framework\src\main\resources" "d:\malleco\MallEcoAPI\public\resources" /E /I
```

### Linux/Mac 命令
```bash
# 复制轮播图资源
cp -r "d:/malleco/MallEcoJava/common-api/src/main/resources/slider" "d:/malleco/MallEcoAPI/public/slider"

# 复制验证文件
cp -r "d:/malleco/MallEcoJava/buyer-api/src/main/resources/static" "d:/malleco/MallEcoAPI/public/static"

# 复制框架资源
cp -r "d:/malleco/MallEcoJava/framework/src/main/resources" "d:/malleco/MallEcoAPI/public/resources"
```

## 注意事项

1. 确保目标目录存在，如果不存在需要先创建
2. 复制完成后，API版将拥有与Java版相同的静态资源结构
3. 这些资源主要用于前端展示、验证和系统功能支持