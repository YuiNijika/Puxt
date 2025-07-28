<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

Anon_Common::Header();

try {

    $db = new Anon_Database();
    $userInfo = $db->getUserInfo($_SESSION['user_id']);

    // 只处理GET请求
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => '请求方法不被允许']);
        exit;
    }

    if ($userInfo) {
        echo json_encode([
            'success' => true,
            'data' => $userInfo
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'userInfo' => null
    ]);
} catch (Exception $e) {
    error_log('检查登录状态错误: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => '获取用户信息发生错误'
    ]);
}
