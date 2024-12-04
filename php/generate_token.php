<?php
function generate_token($client_id, $client_secret)
{
    $url = 'https://ims-na1.adobelogin.com/ims/token/v3';

    $postFields = http_build_query([
        'client_id' => $client_id,
        'client_secret' => $client_secret,
        'grant_type' => 'client_credentials',
        'scope' => 'openid,AdobeID,additional_info.projectedProductContext',
    ]);

    $ch = curl_init();

    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postFields,
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/x-www-form-urlencoded",
        ],
    ]);

    $result = curl_exec($ch);

    if ($result === false) {
        error_log('cURL Error: ' . curl_error($ch));
        curl_close($ch);
        return false;
    }

    $response = json_decode($result, true);

    curl_close($ch);

    if (isset($response['access_token'])) {
        return $response['access_token'];
    }
    
    return false;
}
