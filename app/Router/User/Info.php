<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

Anon_Common::Header();

try {

    $db = new Anon_Database();
    $userInfo = $db->getUserInfo($_SESSION['user_id']);

    // 只处理GET请求
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        Anon_ResponseHelper::methodNotAllowed('GET');
    }

    if ($userInfo) {
        Anon_ResponseHelper::success($userInfo, '获取用户信息成功');
    }

    Anon_ResponseHelper::success(['userInfo' => null], '用户信息为空');
} catch (Exception $e) {
    Anon_ResponseHelper::handleException($e, '获取用户信息发生错误');
}
