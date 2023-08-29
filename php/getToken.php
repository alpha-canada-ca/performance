<?php

require_once('generate_jwt.php');
require_once('generate_token.php');
require_once('api_get.php');
require_once('api_post.php');
$config = include('config.php');
$randIndex = array_rand($config, 1);

$fp = fopen("../keys/secret.pem", "r");
$priv_key = fread($fp, 8192);
fclose($fp);

$jwt = generate_jwt(
    $priv_key,
    $config[$randIndex]['ADOBE_ORG_ID'],
    $config[$randIndex]['ADOBE_TECH_ID'],
    'https://ims-na1.adobelogin.com/c/' .
    $config[$randIndex]['ADOBE_API_KEY']
);

$token = generate_token(
    $config[$randIndex]['ADOBE_API_KEY'],
    $config[$randIndex]['ADOBE_API_SECRET'],
    $jwt
);

$_SESSION["token"] = $token;
$_SESSION['randIndex'] = $randIndex;
?>