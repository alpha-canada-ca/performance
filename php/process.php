<?php
session_start();

function dateRange( $first, $last, $step, $format = 'Y-m-d\TH:i:s.v' ) {
    $dates = [];
    $step = '+1 ' . $step;
    $current = strtotime( $first );
    $last = strtotime( $last );

    while( $current <= $last ) {

        $dates[] = date( $format, $current );
        $current = strtotime( $step, $current );
    }

    return $dates;
}

function array_zip(...$arrays) {
    return array_merge(...array_map(null, ...$arrays));
}

try {
    $d = json_decode(file_get_contents('php://input'));

    $data = include('data.php');
    
    $type = $d->type;
    $url = $d->url;
    $date = $d->dates;
    $start = $date[0];
    $end = $date[1];

    if ( $type == "trnd" ) { 
            $iso = 'Y-m-d\TH:i:s.v';
            $vstep = $date[2];
            $date = dateRange ( $start, $end, $vstep );
            if ( $date[count($date) - 1] != $end ) {
                array_push($date, $end);
            }
            $start = new DateTime($start);
            $start = $start->modify('-1 year')->format($iso);
            $end = new DateTime($end);
            $end = $end->modify('-1 year')->format($iso);
            $date2 = dateRange ( $start, $end, $vstep );
            if ( $date2[count($date2) - 1] != $end ) {
                array_push($date2, $end);
            }
            $date3 = array_merge($date, $date2);
            $cnt = count( $date3 ) - 2;

            $json = $data['trndB']
                    . rtrim( str_repeat( $data['trndMA1'] , $cnt ), ',')
                    . $data['trndMS']
                    . rtrim( str_repeat( $data['trndMA2'] , $cnt ), ',')
                    . $data['trndE'];
    } else { $json = $data[$type]; }

    if ( (isset($type) && !empty($type)) && (isset($url) && !empty($url)) && (isset($json) && !empty($json)) ) {

        if (!isset($_SESSION['CREATED'])) {
            $_SESSION['CREATED'] = time();
            require 'getToken.php';
        } else if (time() - $_SESSION['CREATED'] > 86400) {
            session_regenerate_id(true);
            $_SESSION['CREATED'] = time();
            require 'getToken.php';
        }
        

        if (isset($_SESSION["token"])) {

            require 'api_post.php';
            $config = include('config.php');

            if ( $type == "trnd" ) {             
                $arr = array();
                for ($x = 1; $x < count($date); $x++) {
                    $arr[] = (current($date) . "/" . next($date));
                }
                for ($x = 1; $x < count($date2); $x++) {
                    $arr[] = (current($date2) . "/" . next($date2));
                }
                        
                $id = range(0, $cnt-1);
                $filter = range(1, $cnt);

                $arr1 = array_zip($filter,$id);
                $arr2 = array_zip($id,$arr);
                $dse = array_slice($date, 0, 2);

                $dates = array_merge($dse, $arr1, $arr2);
            }

            $array = ( $type == "trnd"
                        ? array_merge( $dates, array($url) )
                        : array( $start, $end, $url )
                     );
            
            if ( $type == 'srchG' || $type == 'srchI' ) {
                $array = array_merge( $array, array($url) );
            }

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
