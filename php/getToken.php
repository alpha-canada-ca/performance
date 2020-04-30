<?php

require 'generate_jwt.php';
require 'generate_token.php';
require 'api_get.php';
require 'api_post.php';
$config = include('config.php');

$fp = fopen("../keys/secret.pem", "r");
$priv_key = fread($fp, 8192);
fclose($fp);

$jwt = generate_jwt ( $priv_key,
                     $config['ADOBE_ORG_ID'],
                     $config['ADOBE_TECH_ID'],
                     'https://ims-na1.adobelogin.com/c/' .
                        $config['ADOBE_API_KEY'] 
                    );

$token = generate_token ( $config['ADOBE_API_KEY'],
                         $config['ADOBE_API_SECRET'],
                         $jwt
                        ); 

$_SESSION["token"] = $token;

?>