<?php

function generate_token( $apiKey, $secretKey, $jwt )
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://ims-na1.adobelogin.com/ims/exchange/jwt');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);

    curl_setopt($ch, CURLOPT_POSTFIELDS, "client_id=".$apiKey."&client_secret=".$secretKey."&jwt_token=".$jwt);

    $headers = array();
    $headers[] = 'Content-Type: application/x-www-form-urlencoded';

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);

    $token = json_decode($result, true);
    $token = $token["access_token"];

    return $token;
}

?>
