<?php

/**
 * Anon配置
 */
if (!defined('ANON_ALLOWED_ACCESS')) exit;

class Anon_Main
{
    public static function run()
    {
        $App  = __DIR__ . '/../app/';
        $Widget = __DIR__ . '/Widget/';
        $Modules = __DIR__ . '/Modules/';
        
        // 加载核心模块
        require_once $Modules . 'Config.php';
        require_once $Modules  . 'Common.php';
        require_once $Widget  . 'Connection.php';
        require_once $Modules  . 'Database.php';
        require_once $Modules  . 'ResponseHelper.php';
        
        // 加载调试系统
        require_once $Modules . 'Debug.php';
        
        // 加载模块类
        require_once $Modules . '../Install/Install.php';
        
        // 初始化调试系统
        Anon_Debug::init();
        
        // 初始化系统路由
        Anon_Config::initSystemRoutes();
        
        // 加载路由
        require_once $Modules . 'Router.php';
        
        // 记录应用启动
        Anon_Debug::info('Application started', [
            'php_version' => PHP_VERSION,
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time')
        ]);
    }
}

// 启动应用
Anon_Main::run();
