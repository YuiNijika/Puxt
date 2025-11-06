<?php
// #file: d:\Code\KonFans\server\anon\Modules\Database.php

/**
 * Anon Database
 */
if (!defined('ANON_ALLOWED_ACCESS')) exit;

const DatabaseDir = __DIR__ . '/../Database';

const FileName = [
    'Connection',
    'AvatarService',
    'Repository/User',
];

foreach (FileName as $fileName) {
    require_once DatabaseDir . '/' . $fileName . '.php';
}

class Anon_Database
{
    private $userRepository;
    private $avatarService;
    private $messageRepository;
    private $memberRepository;

    /**
     * 构造函数：初始化所有数据仓库和服务实例
     */
    public function __construct()
    {
        $this->avatarService = new Anon_Database_AvatarService();
        $this->userRepository = new Anon_Database_UserRepository();
        $this->messageRepository = new Anon_Database_MessageRepository();
        $this->memberRepository = new Anon_Database_MemberRepository();
    }

    /**
     * 直接访问 QueryBuilder 的入口
     */
    public function db($table)
    {
        return (new Anon_Database_Connection())->db($table);
    }

    /**
     * 执行查询并返回结果
     */
    public function query($sql)
    {
        return (new Anon_Database_Connection())->query($sql);
    }

    /**
     * 准备并返回预处理语句对象
     */
    public function prepare($sql, $params = [])
    {
        return (new Anon_Database_Connection())->prepare($sql);
    }

    /**
     * 动态方法转发：自动导出仓库与服务的方法
     * - 保持现有显式方法兼容（已移除显式导出，不再需要）
     * - 新增方法无需在此类重复导出
     */
    public function __call($name, $arguments)
    {
        $target = $this->resolveForwardTarget($name);
        if ($target && method_exists($target, $name)) {
            return call_user_func_array([$target, $name], $arguments);
        }
        // 回退：遍历所有已知目标，若存在同名方法则调用
        foreach ([$this->userRepository, $this->messageRepository, $this->memberRepository, $this->avatarService] as $repo) {
            if ($repo && method_exists($repo, $name)) {
                return call_user_func_array([$repo, $name], $arguments);
            }
        }
        throw new BadMethodCallException("方法 '" . $name . "' 不存在于 Anon_Database 或其仓库/服务中");
    }

    /**
     * 根据方法名前缀解析目标仓库或服务
     */
    private function resolveForwardTarget($method)
    {
        if (preg_match('/^(getUser|isUser|addUser|updateUser)/', $method)) {
            return $this->userRepository;
        }
        if (preg_match('/^(getMessage|addMessage|updateMessage|deleteMessage)/', $method)) {
            return $this->messageRepository;
        }
        if (preg_match('/^(getMember|addMember|updateMember|deleteMember)/', $method)) {
            return $this->memberRepository;
        }
        if (preg_match('/^(getAvatar)/', $method)) {
            return $this->avatarService;
        }
        return null;
    }
}
