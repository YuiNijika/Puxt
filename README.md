# This is PHP+Nuxt Framework

这是Nuxt+原生PHP的项目脚手架

## 伪静态规则

``` nginx
location / {
	if (!-e $request_filename){
		rewrite  ^(.*)$  /index.php?s=$1  last;   break;
	}
}
```

## 后端方法

### 状态管理

#### 检查登录状态
```php
if (Anon_Check::isLoggedIn()) {
    // 用户已登录
} else {
    // 用户未登录
}
```

### 登录后设置Cookie

```php
Anon_Check::setAuthCookies(123, 'username');
```

### 注销登录
```php
Anon_Check::logout();
```
