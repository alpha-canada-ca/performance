<?php

/**
 * Generate a JWT
 *
 * @param $privateKey The private key filename or string literal to use to sign the token
 * @param $iss The issuer, usually the client_id
 * @param $sub The subject, usually a user_id
 * @param $aud The audience, usually the URI for the oauth server
 * @param $exp The expiration date. If the current time is greater than the exp, the JWT is invalid
 * @param $nbf The "not before" time. If the current time is less than the nbf, the JWT is invalid
 * @param $jti The "jwt token identifier", or nonce for this JWT
 *
 * @return string
 */
function generate_jwt($privateKey, $iss, $sub, $aud, $exp = null, $nbf = null, $jti = null )
{
    $algo = 'RS256';


    if (!$exp) {
        $exp = round ( time() + 24*60*60 );
    }
 
    $payload = array(
		'exp' => $exp,
        'iss' => $iss,
        'sub' => $sub,
        'https://ims-na1.adobelogin.com/s/ent_analytics_bulk_ingest_sdk' => true,
        'aud' => $aud
    );

    if ($nbf) {
        $payload['nbf'] = $nbf;
    }

    if ($jti) {
        $payload['jti'] = $jti;
    }

    $header = array('typ' => 'JWT', 'alg' => $algo);

    $find = array('+', '/', '\r', '\n', '=');
    $replace = array('-', '_');

    $segments = array(
        str_replace($find, $replace, base64_encode(json_encode($header))),
        str_replace($find, $replace, base64_encode(json_encode($payload))),
    );

    $signing_input = implode('.', $segments);

    openssl_sign($signing_input, $signature, $privateKey, 'sha256');

    $segments[] = str_replace($find, $replace, base64_encode($signature));

    return implode('.', $segments);
}

?>
