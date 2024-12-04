<?php

require_once('generate_token.php');
require_once('api_get.php');
require_once('api_post.php');
$config = include('config.php');
$randIndex = array_rand($config, 1);

$token = generate_token(
    $config[$randIndex]['ADOBE_API_KEY'],
    $config[$randIndex]['ADOBE_API_SECRET']
);

$_SESSION["token"] = $token;
$_SESSION['randIndex'] = $randIndex;
?>