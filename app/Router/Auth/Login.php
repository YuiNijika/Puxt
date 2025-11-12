<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

Anon_Common::Header();

try {
    // 只处理POST请求
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Anon_ResponseHelper::methodNotAllowed('POST');
    }

    // 获取POST数据
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    // 如果JSON解析失败，尝试从表单数据获取
    if (!$data) {
        $data = $_POST;
    }

    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    $rememberMe = filter_var($data['rememberMe'] ?? false, FILTER_VALIDATE_BOOLEAN);

    // 验证输入
    if (empty($username) || empty($password)) {
        Anon_ResponseHelper::validationError('用户名和密码均不能为空');
    }

    // 创建数据库实例
    $db = new Anon_Database();

    // 通过userRepository验证用户凭据
    $user = $db->getUserInfoByName($username);
    
    // 如果用户不存在
    if (!$user) {
        Anon_ResponseHelper::error('用户名或密码错误', null, 401);
    }

    // 验证密码
    if (!password_verify($password, $user['password'])) {
        Anon_ResponseHelper::error('用户名或密码错误', null, 401);
    }

    // 登录成功，重置会话ID以防会话固定攻击
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    session_regenerate_id(true);

    // 设置会话变量
    $_SESSION['user_id'] = (int)$user['uid'];
    $_SESSION['username'] = $user['name'];

    // 设置认证Cookie
    Anon_Check::setAuthCookies((int)$user['uid'], $user['name'], $rememberMe);

    // 返回成功响应
    $userData = [
        'user_id' => (int)$user['uid'],
        'username' => $user['name'],
        'email' => $user['email']
    ];
    Anon_ResponseHelper::success($userData, '登录成功');
    
} catch (Exception $e) {
    Anon_ResponseHelper::handleException($e, '登录处理过程中发生错误');
}
