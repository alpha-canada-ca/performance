<?php

function api_get($apiKey, $company_id, $token, $url = null)
{
    if (!$url) {
        $url = '/users/me';
    }

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://analytics.adobe.io/api/' .
        $company_id . $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

    $headers = array();
    $headers[] = "Authorization: Bearer $token";
    $headers[] = "X-Api-Key: " . $apiKey;
    $headers[] = "X-Proxy-Global-Company-Id: " . $company_id;
    $headers[] = "Accept: application/json";
    $headers[] = "Content-Type: application/json";

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        $err = 'Error:' . curl_error($ch);
    }
    curl_close($ch);

    return $result;

}

?>