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
        require_once $Modules . 'Config.php';
        require_once $Modules  . 'Common.php';
        require_once $Modules  . 'Database.php';
        require_once $App . 'App.php';
        require_once $Modules . 'Router.php';
    }
}

// 启动应用
Anon_Main::run();
