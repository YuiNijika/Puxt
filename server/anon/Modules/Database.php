<?php

/**
 * Anon Database
 */
if (!defined('ANON_ALLOWED_ACCESS')) exit;

const DatabaseDir = __DIR__ . '/Database';

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
    private $AvatarService;

    /**
     * 构造函数
     * 初始化所有数据仓库和服务实例
     */
    public function __construct()
    {
        $this->AvatarService = new Anon_Database_AvatarService();
        $this->userRepository = new Anon_Database_UserRepository();
    }

    // 用户相关方法

    /**
     * 获取用户详细信息
     * 
     * @param int $uid 用户唯一ID
     * @return array 包含用户所有信息的关联数组
     */
    public function getUserInfo($uid)
    {
        return $this->userRepository->getUserInfo($uid);
    }

    /**
     * 通过用户名获取用户信息
     * 
     * @param string $name 用户名
     * @return array 用户信息数组，找不到返回空数组
     */
    public function getUserInfoByName($name)
    {
        return $this->userRepository->getUserInfoByName($name);
    }

    /**
     * 检查用户是否属于特定组别
     * 
     * @param int $uid 用户ID
     * @param string $group 要检查的组别名称(如'admin')
     * @return bool 是否属于该组
     */
    public function isUserInGroup($uid, $group)
    {
        return $this->userRepository->isUserInGroup($uid, $group);
    }

    /**
     * 检查用户是否为管理员
     * 
     * @param int $uid 用户ID
     * @return bool 返回用户是否为管理员
     */
    public function isUserAdmin($uid)
    {
        return $this->userRepository->isUserAdmin($uid);
    }

    /**
     * 检查用户是否为作者
     * 
     * @param int $uid 用户ID
     * @return bool 返回用户是否为作者
     */
    public function isUserAuthor($uid)
    {
        return $this->userRepository->isUserAuthor($uid);
    }

    /**
     * 检查用户是否有内容管理权限（管理员或作者）
     * 
     * @param int $uid 用户ID
     * @return bool 返回用户是否有内容管理权限
     */
    public function hasContentManagementPermission($uid)
    {
        return $this->userRepository->hasContentManagementPermission($uid);
    }

    /**
     * 获取用户权限等级
     * 
     * @param int $uid 用户ID
     * @return int 权限等级：0=普通用户, 1=作者, 2=管理员
     */
    public function getUserPermissionLevel($uid)
    {
        return $this->userRepository->getUserPermissionLevel($uid);
    }

    /**
     * 添加用户（支持不同用户组）
     * 
     * @param string $name 用户名
     * @param string $email 用户邮箱
     * @param string $password 已加密的密码
     * @param string $group 用户组别(默认'user')
     * @return bool 添加成功返回true，失败false
     */
    public function addUser($name, $email, $password, $group = 'user')
    {
        return $this->userRepository->addUser($name, $email, $password, $group);
    }

    /**
     * 添加管理员用户
     * 
     * @param string $name 用户名
     * @param string $email 用户邮箱
     * @param string $password 已加密的密码
     * @param string $group 用户组别(默认'admin')
     * @return bool 添加成功返回true，失败false
     */
    public function addAdminUser($name, $email, $password, $group = 'admin')
    {
        return $this->userRepository->addAdminUser($name, $email, $password, $group);
    }

    /**
     * 更新用户密码
     * 
     * @param int $uid 用户ID
     * @param string $newPassword 新密码(未加密)
     * @return bool 更新是否成功
     */
    public function updateUserPassword($uid, $newPassword)
    {
        return $this->userRepository->updateUserPassword($uid, $newPassword);
    }

    /**
     * 修改用户组
     * 
     * @param int $uid 用户ID
     * @param string $group 新的用户组
     * @return bool 修改是否成功
     */
    public function updateUserGroup($uid, $group)
    {
        return $this->userRepository->updateUserGroup($uid, $group);
    }

    /**
     * 检查邮箱是否已被注册
     * 
     * @param string $email 要检查的邮箱地址
     * @return bool 邮箱已存在返回true
     */
    public function isEmailExists($email)
    {
        return $this->userRepository->isEmailExists($email);
    }

    // 头像服务
    /**
     * 获取Avatar头像链接
     * 
     * @param string|null $email 用户邮箱(为空时返回默认头像)
     * @param int $size 头像尺寸(像素，默认640)
     * @return string 完整的Avatar头像URL
     */
    public function getAvatar($email = null, $size = 640)
    {
        return $this->avatarService->getAvatar($email, $size);
    }

    // 数据库连接相关方法（从父类继承）

    /**
     * 执行查询并返回结果
     * 
     * @param string $sql SQL查询语句
     * @return array 查询结果数组
     */
    public function query($sql)
    {
        return $this->userRepository->query($sql);
    }

    /**
     * 准备并执行SQL语句
     * 
     * @param string $sql SQL语句
     * @param array $params 参数数组
     * @return mysqli_stmt 返回预处理语句对象
     */
    public function prepare($sql, $params = [])
    {
        return $this->userRepository->prepare($sql, $params);
    }
}
