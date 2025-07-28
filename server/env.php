<?php
/**
 * Anon配置
 */
if (!defined('ANON_ALLOWED_ACCESS')) exit;

// 数据库配置
define('ANON_DB_HOST', 'localhost');
define('ANON_DB_PORT', 3306);
define('ANON_DB_PREFIX', 'puxt_');
define('ANON_DB_USER', 'root');
define('ANON_DB_PASSWORD', 'root');
define('ANON_DB_DATABASE', 'puxt');
define('ANON_DB_CHARSET', 'utf8mb4');

// 是否安装程序
define('ANON_INSTALLED', false);
// Debug
define('ANON_ROUTER_DEBUG', false);

// 站点配置
$AnonSite = [
    'HTTPS' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
];

require_once __DIR__ . '/anon/Main.php';