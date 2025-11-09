## 快速开始

```php
// server/env.php
define('ANON_DEBUG', true); // 开启调试

// 入口：server/index.php
$db = new Anon_Database(); // 自动导出，直接用仓库方法
```

## 数据库操作

> 只填值，逻辑都封装

```php
// 用户
$db->addUser('name', 'email@ex.com', 'password', 'user');
$db->updateUserGroup(123, 'admin');
$db->isUserAdmin(123);
$db->getUserInfo(123);

// 头像
$db->getAvatar('email@ex.com', 640);
```

## 用户认证

```php
Anon_Check::isLoggedIn();                // 检查登录
Anon_Check::setAuthCookies(123, 'name'); // 登录后设置 Cookie
$db->getUserInfoByName('name');          // 获取用户信息
```

## 调试工具

```php
// 打点日志
Anon_Debug::log('INFO', 'message');
Anon_Debug::log('ERROR', 'boom');

// 性能/SQL
Anon_Debug::performance('op', microtime(true));
Anon_Debug::query('SELECT ...', ['p1' => 1], 12.3);

// Web 控制台
// http://localhost:8080/anon/debug/console
```

## 钩子系统

```php
// 动作钩子
add_action('user_login', function ($u) { /* ... */ });
do_action('user_login', 'admin');

// 过滤器钩子
add_filter('content_filter', fn($c) => str_replace('bad','***',$c));
apply_filters('content_filter', $content);

// 钩子控制台
// http://localhost:8080/anon/debug/hook/console
```

## 路由系统

```php
// 动态注册
Anon_Config::addRoute('/api/test', function () {
    echo json_encode(['ok' => true]);
});

// 错误处理
Anon_Config::addErrorHandler(404, fn() => print(json_encode(['error'=>404])));
Anon_Config::addErrorHandler(500, fn() => print(json_encode(['error'=>500])));
```

## 约定

- `Anon_Database` 自动导出数据库方法：新增数据库方法后，直接 `$db->方法名(...)` 调用。
- 业务层不要写 SQL；用数据库方法。`$db->db()` 为数据库内部使用。
- 路由位于 `server/app/Router/*`，直接在回调里用 `$db` 完成功能。

## 运行

- 直接部署 `server` 目录（示例 Nginx 配置：`server/nginx.conf`）。
- 日志：`server/logs/`。
