<?php

function api_post( $apiKey, $company_id, $token, $data )
{
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://analytics.adobe.io/api/' .
                                    $company_id . '/reports');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');

    $headers = array();
    $headers[] = "Authorization: Bearer $token";
    $headers[] = "X-Api-Key: " . $apiKey;
    $headers[] = "X-Proxy-Global-Company-Id: " . $company_id;
    $headers[] = "Accept: application/json";
    $headers[] = "Content-Type: application/json";

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        $err = 'Error:' . curl_error($ch);
    }
    curl_close($ch);

    return $result; 

}

?>
