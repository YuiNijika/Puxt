<?php 
if (!defined('ANON_ALLOWED_ACCESS')) exit;

$routeConfigs = [
    // 程序安装路由，安装后可以删除处理
    [
        'route' => 'anon/install',
        'handler' => function () {
            require_once __DIR__ . '/Install/Install.php';
        },
        'useLoginCheck' => false,
    ],
    // API路由
    [
        'route' => 'api/auth/login',
        'handler' => function () {
            Anon_Router::View('Auth/Login');
        },
        'useLoginCheck' => false,
    ],
    [
        'route' => 'api/auth/logout',
        'handler' => function () {
            Anon_Router::View('Auth/Logout');
        },
        'useLoginCheck' => false,
    ],
    [
        'route' => 'api/auth/check-login',
        'handler' => function () {
            Anon_Router::View('Auth/CheckLogin');
        },
        'useLoginCheck' => false,
    ],
    [
        'route' => 'api/user/info',
        'handler' => function () {
            Anon_Router::View('User/Info');
        },
        'useLoginCheck' => true,
    ],
];

/**
 * 注册路由
 */
foreach ($routeConfigs as $config) {
    $handler = $config['handler'];
    // 添加登录状态检查
    if ($config['useLoginCheck']) {
        $handler = function () use ($handler) {
            if (!Anon_Check::isLoggedIn()) {
                Anon_Common::Header();
                echo json_encode([
                    'code' => 401,
                    'message' => 'Unauthorized'
                ]);
                exit; 
            }
            $handler();
        };
    }

    Anon_Config::addRoute($config['route'], $handler);
}