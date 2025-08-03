<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

Anon_Common::Header();

try {
    // 只处理POST请求
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => '请求方法不被允许']);
        exit;
    }

    // 确保会话已启动
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // 执行登出操作
    Anon_Check::logout();
    
    // 返回成功响应
    echo json_encode([
        'success' => true,
        'message' => '登出成功'
    ]);
    
} catch (Exception $e) {
    error_log('登出处理错误: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => '登出过程中发生错误'
    ]);
}
?>