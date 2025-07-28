<?php

/**
 * 用户数据仓库
 */

if (!defined('ANON_ALLOWED_ACCESS')) exit;

class Anon_Database_UserRepository extends Anon_Database_Connection
{
    protected $avatarService;

    public function __construct()
    {
        parent::__construct();
        $this->avatarService = new Anon_Database_AvatarService();
    }

    /**
     * 获取用户信息
     * @param int $uid 用户ID
     * @return array 用户信息
     */
    public function getUserInfo($uid)
    {
        $sql = "SELECT * FROM " . ANON_DB_PREFIX . "users WHERE uid = ?";
        $stmt = $this->prepare($sql, [$uid]);
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($userId, $name, $password, $email, $group);
            $stmt->fetch();
            $stmt->close();
            return [
                'uid' => $userId,
                'name' => $name,
                'email' => $email,
                'avatar' => $this->avatarService->getAvatar($email),
                'group' => $group,
            ];
        }

        $stmt->close();
        return null;
    }

    /**
     * 检查用户是否属于指定用户组
     * 
     * @param int $uid 用户ID
     * @param string $group 用户组名称
     * @return bool 返回用户是否属于指定用户组
     */
    public function isUserInGroup($uid, $group)
    {
        $sql = "SELECT COUNT(*) FROM " . ANON_DB_PREFIX . "users WHERE uid = ? AND `group` = ?";
        $stmt = $this->prepare($sql, [$uid, $group]);
        $stmt->store_result();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }

    /**
     * 检查用户是否为管理员
     * 
     * @param int $uid 用户ID
     * @return bool 返回用户是否为管理员
     */
    public function isUserAdmin($uid)
    {
        $sql = "SELECT COUNT(*) FROM " . ANON_DB_PREFIX . "users WHERE uid = ? AND `group` = 'admin'";
        $stmt = $this->prepare($sql, [$uid]);
        $stmt->store_result();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }

    /**
     * 检查用户是否为作者
     * 
     * @param int $uid 用户ID
     * @return bool 返回用户是否为作者
     */
    public function isUserAuthor($uid)
    {
        $sql = "SELECT COUNT(*) FROM " . ANON_DB_PREFIX . "users WHERE uid = ? AND `group` = 'author'";
        $stmt = $this->prepare($sql, [$uid]);
        $stmt->store_result();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }

    /**
     * 检查用户是否有内容管理权限（管理员或作者）
     * 
     * @param int $uid 用户ID
     * @return bool 返回用户是否有内容管理权限
     */
    public function hasContentManagementPermission($uid)
    {
        $sql = "SELECT COUNT(*) FROM " . ANON_DB_PREFIX . "users WHERE uid = ? AND `group` IN ('admin', 'author')";
        $stmt = $this->prepare($sql, [$uid]);
        $stmt->store_result();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }

    /**
     * 获取用户权限等级
     * 
     * @param int $uid 用户ID
     * @return int 权限等级：0=普通用户, 1=作者, 2=管理员
     */
    public function getUserPermissionLevel($uid)
    {
        $sql = "SELECT `group` FROM " . ANON_DB_PREFIX . "users WHERE uid = ?";
        $stmt = $this->prepare($sql, [$uid]);
        $stmt->store_result();
        
        if ($stmt->num_rows > 0) {
            $stmt->bind_result($group);
            $stmt->fetch();
            $stmt->close();
            
            switch ($group) {
                case 'admin':
                    return 2;
                case 'author':
                    return 1;
                default:
                    return 0;
            }
        }
        
        $stmt->close();
        return 0;
    }

    /**
     * 通过用户名获取用户信息
     * @param string $name 用户名
     * @return array|bool 返回用户信息数组或false
     */
    public function getUserInfoByName($name)
    {
        $sql = "SELECT uid, name, password, email, `group` FROM " . ANON_DB_PREFIX . "users WHERE name = ?";
        $stmt = $this->prepare($sql, [$name]);
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($uid, $name, $password, $email, $group);
            $stmt->fetch();
            $result = [
                'uid' => $uid,
                'name' => $name,
                'password' => $password,
                'email' => $email,
                'group' => $group
            ];
            $stmt->close();
            return $result;
        }

        $stmt->close();
        return false;
    }

    /**
     * 添加用户（支持不同用户组）
     * @param string $name
     * @param string $email
     * @param string $password
     * @param string $group
     * @return bool 添加成功返回true，否则返回false
     */
    public function addUser($name, $email, $password, $group = 'user')
    {
        // 验证用户组是否有效
        $validGroups = ['admin', 'author', 'user'];
        if (!in_array($group, $validGroups)) {
            throw new Exception('无效的用户组');
        }

        $this->conn->begin_transaction();

        try {
            $sql = "INSERT INTO " . ANON_DB_PREFIX . "users 
            (name, email, password, `group`) 
            VALUES (?, ?, ?, ?)";

            $stmt = $this->prepare($sql, [
                $name,
                $email,
                $password,
                $group
            ]);

            $stmt->execute();
            $success = $stmt->affected_rows > 0;
            $stmt->close();
            $this->conn->commit();
            return $success;
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * 添加管理员用户
     * @param string $name
     * @param string $email
     * @param string $password
     * @param string $group
     * @return bool 添加成功返回true，否则返回false
     */
    public function addAdminUser($name, $email, $password, $group = 'admin')
    {
        return $this->addUser($name, $email, $password, $group);
    }

    /**
     * 修改用户密码
     * @param int $uid 用户ID
     * @param string $newPassword 新密码
     * @return bool 修改成功返回true，否则返回false
     */
    public function updateUserPassword($uid, $newPassword)
    {
        $this->conn->begin_transaction();

        try {
            $sql = "UPDATE " . ANON_DB_PREFIX . "users 
            SET password = ? 
            WHERE uid = ?";

            $stmt = $this->prepare($sql, [
                $newPassword,
                $uid
            ]);

            $stmt->execute();
            $success = $stmt->affected_rows > 0;
            $stmt->close();
            $this->conn->commit();
            return $success;
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * 修改用户组
     * @param int $uid 用户ID
     * @param string $group 新的用户组
     * @return bool 修改成功返回true，否则返回false
     */
    public function updateUserGroup($uid, $group)
    {
        // 验证用户组是否有效
        $validGroups = ['admin', 'author', 'user'];
        if (!in_array($group, $validGroups)) {
            throw new Exception('无效的用户组');
        }

        $this->conn->begin_transaction();

        try {
            $sql = "UPDATE " . ANON_DB_PREFIX . "users 
            SET `group` = ? 
            WHERE uid = ?";

            $stmt = $this->prepare($sql, [
                $group,
                $uid
            ]);

            $stmt->execute();
            $success = $stmt->affected_rows > 0;
            $stmt->close();
            $this->conn->commit();
            return $success;
        } catch (Exception $e) {
            $this->conn->rollback();
            throw $e;
        }
    }

    /**
     * 检查邮箱是否已存在
     * @param string $email 邮箱
     * @return bool 返回邮箱是否已存在
     */
    public function isEmailExists($email)
    {
        $sql = "SELECT COUNT(*) FROM " . ANON_DB_PREFIX . "users WHERE email = ?";
        $stmt = $this->prepare($sql, [$email]);
        $stmt->store_result();
        $stmt->bind_result($count);
        $stmt->fetch();
        $stmt->close();
        return $count > 0;
    }
}