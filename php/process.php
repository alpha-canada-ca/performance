<?php
session_start();

try {
    $data = include('data.php');
    $type = trim($_REQUEST["type"]);
    $id = trim($_REQUEST["url"]);
    $json = ( isset( $data[$type] ) ? $data[$type] : null );

    if ( (isset($type) && !empty($type)) && (isset($id) && !empty($id)) && (isset($json) && !empty($json)) ) {

        if (!isset($_SESSION['CREATED'])) {
            $_SESSION['CREATED'] = time();
            require 'getToken.php';
        } else if (time() - $_SESSION['CREATED'] > 86400) {
            session_regenerate_id(true);
            $_SESSION['CREATED'] = time();
            require 'getToken.php';
        }

        if (!empty($_SESSION["token"])) {
            require 'api_post.php';
            include 'date.php';
            $config = include('config.php');

            $array = ( $type == "trnd"
                        ? array_merge( $dates, array($id) )
                        : array( $fromDate, $toDate, $id )
                     );

            $json = vsprintf($json, $array);

            $api = api_post( $config['ADOBE_API_KEY'],
                             $config['COMPANY_ID'],
                             $_SESSION['token'],
                             $json
                           ); 
        } else {
            $api = json_encode( array('error' => "No data") );
        }
        
        echo ($api);
    } else {
        echo json_encode( array('error' => "No data") );
    }
} catch (Exception $ex) {
    echo json_encode( array('error' => $ex) );
}

?>
