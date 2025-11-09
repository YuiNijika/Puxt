<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

Anon_Common::Header();

try {
    // 只处理GET请求
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Anon_ResponseHelper::methodNotAllowed('GET');
    }

    // 确保会话已启动
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 检查用户是否已登录
    if (Anon_Check::isLoggedIn()) {
        Anon_ResponseHelper::success(['logged_in' => true], '用户已登录');
    }

    // 未登录
    Anon_ResponseHelper::success(['logged_in' => false], '用户未登录');
    
} catch (Exception $e) {
    Anon_ResponseHelper::handleException($e, '检查登录状态时发生错误');
}
?>