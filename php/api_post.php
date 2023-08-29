<?php

function api_post($apiKey, $company_id, $token, $arrayData)
{
  // array of curl handles
  $multiCurl = array();
  // data to be returned
  $result = array();
  // multi handle
  $mh = curl_multi_init();
  //$ch = curl_init();

  $headers = array();
  $headers[] = "Authorization: Bearer $token";
  $headers[] = "X-Api-Key: " . $apiKey;
  $headers[] = "X-Proxy-Global-Company-Id: " . $company_id;
  $headers[] = "Accept: application/json";
  $headers[] = "Content-Type: application/json";

  $fetchUrl = 'https://analytics.adobe.io/api/' . $company_id . '/reports';

  foreach ($arrayData as $i => $data) {
    // URL from which data will be fetched
    $multiCurl[$i] = curl_init();
    curl_setopt($multiCurl[$i], CURLOPT_URL, $fetchUrl);
    curl_setopt($multiCurl[$i], CURLOPT_POST, 1);
    curl_setopt($multiCurl[$i], CURLOPT_CUSTOMREQUEST, 'POST');
    curl_setopt($multiCurl[$i], CURLOPT_HTTPHEADER, $headers);
    curl_setopt($multiCurl[$i], CURLOPT_POSTFIELDS, $data[0]);
    curl_setopt($multiCurl[$i], CURLOPT_RETURNTRANSFER, true);

    curl_multi_add_handle($mh, $multiCurl[$i]);
  }

  $index = null;
  do {
    curl_multi_exec($mh, $index);
  } while ($index > 0);
  // get content and remove handles
  foreach ($multiCurl as $k => $ch) {
    $result[$k] = curl_multi_getcontent($ch);
    curl_multi_remove_handle($mh, $ch);
  }
  // close
  curl_multi_close($mh);

  /*
  $result = curl_exec($ch);
  if (curl_errno($ch)) {
      $err = 'Error:' . curl_error($ch);
  }
  curl_close($ch);
  */

  return $result;

  //test

}

?>