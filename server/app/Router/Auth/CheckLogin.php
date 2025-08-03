<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

Anon_Common::Header();

try {
    // 只处理GET请求
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => '请求方法不被允许']);
        exit;
    }

    // 确保会话已启动
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 检查用户是否已登录
    if (Anon_Check::isLoggedIn()) {
        echo json_encode([
            'success' => true,
            'logged_in' => true
        ]);
        exit;
    }

    // 未登录
    echo json_encode([
        'success' => true,
        'logged_in' => false
    ]);
    
} catch (Exception $e) {
    error_log('检查登录状态错误: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => '检查登录状态时发生错误'
    ]);
}
?>