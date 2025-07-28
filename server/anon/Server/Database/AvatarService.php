<?php

/**
 * Avatar头像服务
 */
if (!defined('ANON_ALLOWED_ACCESS')) exit;

class Anon_Database_AvatarService
{
    /**
     * 生成 Avatar 头像 URL
     */
    public function getAvatar($email = null, $size = 640)
    {
        if (!$email) {
            return "https://www.cravatar.cn/avatar/?s={$size}&d=retro";
        }

        $trimmedEmail = trim(strtolower($email));
        $hash = md5($trimmedEmail);
        return "https://www.cravatar.cn/avatar/{$hash}?s={$size}&d=retro";
    }
}