# API 服务模块

这个目录包含了重构后的API服务模块，将原来的单一文件拆分为多个模块化文件，提高了代码的可维护性和可读性。

## 文件结构

```
api/
├── config.js      # API配置文件
├── core.js        # 核心ApiService类
├── auth.js        # 认证相关API
├── user.js        # 用户相关API
├── utils.js       # 工具函数
└── README.md      # 说明文档
```

## 模块说明

### config.js
- API基础配置
- SSR环境配置
- 缓存配置

### core.js
- 核心ApiService类
- HTTP请求封装
- 重试机制
- SSR/客户端环境适配

### auth.js
- 认证相关API接口
- 认证管理器（useAuthManager）
- 登录、登出、状态检查功能

### user.js
- 用户相关API接口
- 用户管理器（useUserManager）
- 用户信息获取、更新、缓存管理

### utils.js
- 错误处理函数
- 响应标准化
- 本地存储管理
- 缓存管理器

## 使用方法

### 基础使用

```javascript
// 导入主服务
import { useApiService } from '../useApiService.js'

const api = useApiService()

// 使用基础HTTP方法
const data = await api.get('endpoint')
const result = await api.post('endpoint', { data })
```

### 使用分类API

```javascript
// 认证API
import { authApi, useAuthManager } from '../useApiService.js'

// 直接使用API
const loginResult = await authApi.login(credentials)

// 使用管理器（推荐）
const authManager = useAuthManager()
const result = await authManager.login(credentials)
```

### 使用用户API

```javascript
// 用户API
import { userApi, useUserManager } from '../useApiService.js'

// 直接使用API
const userInfo = await userApi.getUserInfo()

// 使用管理器（推荐）
const userManager = useUserManager()
const result = await userManager.getUserInfo()
```

### 使用工具函数

```javascript
import { handleApiError, normalizeApiResponse } from '../useApiService.js'

try {
  const response = await someApiCall()
  const data = normalizeApiResponse(response)
} catch (error) {
  const message = handleApiError(error, '操作失败')
}
```

## 优势

1. **模块化**: 每个文件职责单一，便于维护
2. **可扩展**: 新增API类型只需添加对应文件
3. **类型安全**: 更好的代码组织有利于类型检查
4. **缓存优化**: 独立的缓存管理器，支持更灵活的缓存策略
5. **错误处理**: 统一的错误处理机制
6. **向后兼容**: 保持原有API接口不变

## 迁移指南

原有的使用方式仍然有效：

```javascript
// 原有方式仍然可用
import { useApiService, authApi, userApi } from './useApiService.js'

// 新增的管理器方式（推荐）
import { useAuthManager, useUserManager } from './useApiService.js'
```

所有原有功能都得到保留，同时新增了更强大的管理器功能。