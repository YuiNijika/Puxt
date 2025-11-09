<?php
if (!defined('ANON_ALLOWED_ACCESS')) exit;

// 检查安装状态并重定向到安装页面
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$isInstallRoute = (strpos($requestUri, '/install') !== false || strpos($requestUri, '/anon') !== false);

if (!$isInstallRoute && !Anon_Config::isInstalled()) {
    header('Location: /anon/install');
    exit;
}

class Anon_Common
{
    /**
     * 通用Header
     */
    public static function Header($code = 200, $response = true): void
    {
        http_response_code($code);
        if ($response) {
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Methods: *");
            header("Access-Control-Allow-Headers: Content-Type, Authorization");
            header('Content-Type: application/json; charset=utf-8');
        }
    }

    /**
     * 系统信息
     */
    public static function SystemInfo(): array
    {
        return [
            'PHP_VERSION' => PHP_VERSION,
            'SERVER_SOFTWARE' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? 'Unknown',
            'SERVER_PORT' => $_SERVER['SERVER_PORT'] ?? 'Unknown',
            'SERVER_PROTOCOL' => $_SERVER['SERVER_PROTOCOL'] ?? 'Unknown',
        ];
    }

    /**
     * 获取客户端真实IP
     * @return string
     */
    public static function GetClientIp()
    {
        // 可能的IP来源数组
        $sources = [
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'REMOTE_ADDR'
        ];

        foreach ($sources as $source) {
            if (!empty($_SERVER[$source])) {
                $ip = $_SERVER[$source];

                // 处理X-Forwarded-For可能有多个IP的情况
                if ($source === 'HTTP_X_FORWARDED_FOR') {
                    $ips = explode(',', $ip);
                    $ip = trim($ips[0]);
                }

                // 验证IP格式
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    // 将IPv6本地回环地址转换为IPv4格式
                    if ($ip === '::1') {
                        return '127.0.0.1';
                    }
                    return $ip;
                }
            }
        }

        // 所有来源都找不到有效IP时返回默认值
        return null;
    }
}

class Anon_Check
{
    /**
     * 检查用户是否已登录
     * 
     * @return bool 返回是否已登录
     */
    public static function isLoggedIn(): bool
    {
        self::startSessionIfNotStarted();

        // 检查会话中的用户ID
        if (!empty($_SESSION['user_id'])) {
            return true;
        }

        // 检查Cookie中的用户ID和用户名
        if (!empty($_COOKIE['user_id']) && !empty($_COOKIE['username'])) {
            // 验证Cookie值是否有效
            if (self::validateCookie($_COOKIE['user_id'], $_COOKIE['username'])) {
                $_SESSION['user_id'] = (int)$_COOKIE['user_id'];
                $_SESSION['username'] = $_COOKIE['username'];
                return true;
            }
        }

        return false;
    }

    /**
     * 用户注销
     */
    public static function logout(): void
    {
        self::startSessionIfNotStarted();

        // 清空会话数据
        $_SESSION = [];

        // 重置会话数组
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }

        session_destroy();

        // 清除认证Cookie
        self::clearAuthCookies();
    }

    /**
     * 设置认证Cookie
     * 
     * @param int $userId 用户ID
     * @param string $username 用户名
     * @param bool $rememberMe 是否记住登录状态
     */
    public static function setAuthCookies(int $userId, string $username, bool $rememberMe = false): void
    {
        global $AnonSite;

        $cookieOptions = [
            'path'     => '/',
            'httponly' => true,
            'secure'   => $AnonSite['HTTPS'] ?? false,
            'samesite' => 'Lax'
        ];

        // 根据"记住我"选项设置cookie过期时间
        if ($rememberMe) {
            // 记住30天
            $cookieOptions['expires'] = time() + (86400 * 30);
        } else {
            // 会话cookie（浏览器关闭时失效）
            $cookieOptions['expires'] = 0;
        }

        setcookie('user_id', (string)$userId, $cookieOptions);
        setcookie('username', $username, $cookieOptions);
    }

    /**
     * 清除认证Cookie
     */
    private static function clearAuthCookies(): void
    {
        global $AnonSite;

        $cookieOptions = [
            'expires'  => time() - 3600,
            'path'     => '/',
            'httponly' => true,
            'secure'   => $AnonSite['HTTPS'] ?? false,
            'samesite' => 'Lax'
        ];

        setcookie('user_id', '', $cookieOptions);
        setcookie('username', '', $cookieOptions);
    }

    /**
     * 验证Cookie值是否有效
     * 
     * @param mixed $userId 用户ID
     * @param string $username 用户名
     * @return bool 返回是否有效
     */
    private static function validateCookie($userId, string $username): bool
    {
        // 验证用户ID是否为数字且大于0
        if (!is_numeric($userId) || (int)$userId <= 0) {
            return false;
        }

        // 验证用户名不为空
        if (empty($username)) {
            return false;
        }

        // 可以添加更严格的验证，例如查询数据库验证用户是否存在
        $db = new Anon_Database();
        $userInfo = $db->getUserInfo((int)$userId);

        return $userInfo && $userInfo['name'] === $username;
    }

    /**
     * 如果会话未启动，则启动会话
     */
    private static function startSessionIfNotStarted(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start([
                'cookie_httponly' => true,
                'cookie_secure'   => $_SERVER['HTTPS'] ?? false,
                'cookie_samesite' => 'Lax'
            ]);
        }
    }
}
