<?php
/**
 * 数据库连接基础类
 */

if (!defined('ANON_ALLOWED_ACCESS')) exit;

class Anon_Database_Connection
{
    protected $conn;

    public function __construct()
    {
        $this->conn = new mysqli(
            ANON_DB_HOST,
            ANON_DB_USER,
            ANON_DB_PASSWORD,
            ANON_DB_DATABASE,
            ANON_DB_PORT
        );

        if ($this->conn->connect_error) {
            die("数据库连接失败: " 。 $this->conn->connect_error);
        }

        $this->conn->set_charset(ANON_DB_CHARSET);
    }

    /**
     * 执行查询并返回结果
     */
    公共 function query($sql)
    {
        $result = $this->conn->query($sql);
        if (!$result) {
            die("SQL 查询错误: " 。 $this->conn->error);
        }

        if ($result instanceof mysqli_result) {
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            return $rows;
        }

        return $this->conn->affected_rows;
    }

    /**
     * 准备预处理语句 不执行
     */
    public function prepare($sql, $params = [])
    {
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            die("SQL 预处理错误: " . $this->conn->error);
        }

        if (!empty($params)) {
            $types = '';
            $bindParams = [];

            foreach ($params as $param) {
                if (is_null($param)) {
                    $types .= 's';
                    $bindParams[] = null;
                } else {
                    $types .= 's';
                    $bindParams[] = $param;
                }
            }

            $stmt->bind_param($types, ...$bindParams);
        }

        // 不再自动执行，只准备语句
        return $stmt;
    }

    public function __destruct()
    {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
