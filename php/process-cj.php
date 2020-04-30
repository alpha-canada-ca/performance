<?php
session_start();

function dateRange($first, $last, $step, $format = 'Y-m-d\TH:i:s.v')
{
    $dates = [];
    $step = '+1 ' . $step;
    $current = strtotime($first);
    $last = strtotime($last);

    while ($current <= $last)
    {

        $dates[] = date($format, $current);
        $current = strtotime($step, $current);
    }

    return $dates;
}

function array_zip(...$arrays)
{
    return array_merge(...array_map(null, ...$arrays));
}

// returns true if $needle is a substring of $haystack
function contains($needle, $haystack)
{
    return strpos($haystack, $needle) !== false;
}

function strposa($haystack, $needle, $offset=0) {
    if(!is_array($needle)) $needle = array($needle);
    foreach($needle as $query) {
        if(strpos($haystack, $query, $offset) !== false) return true; // stop on first true result
    }
    return false;
}

try
{
    $data = include ('data.php');

    $url = $_REQUEST["url"];
    $start = $_REQUEST["start"];
    $end = $_REQUEST["end"];

    $mode = (empty($_REQUEST["mode"])) ? "update" : $_REQUEST["mode"];

    if ((!isset($start) && empty($start)) && (!isset($end) && empty($empty)))
    {
        $iso = 'Y-m-d\TH:i:s.v';
        $today = new DateTime("today");
        $end = $today->format($iso);

        $yesterday = $today->modify('-1 day')
            ->format($iso);
        $week = $today->modify('-6 day')
            ->format($iso);
        $month = $today->modify('-23 day')
            ->format($iso);

        $dates = [$month, $week, $yesterday];

    }
    else if ((isset($start) && !empty($start)) && (isset($start) && !empty($start)))
    {
        $iso = 'Y-m-d\TH:i:s.v';
        $start = (new DateTime($start))->format($iso);
        $end = (new DateTime($end))->format($iso);

        $dates = [$start];
    }

    if ((isset($url) && !empty($url)))
    {

        /*
        $csv = array_map('str_getcsv', file('file.csv' , FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        
        $header = array_shift($csv);
        
        $col = array_search("URL", $header);
        */

        require 'mongodb_update.php';
        require 'mongodb_get.php';
        require 'mongodb_sUpdate.php';
        require 'mongodb_sGet.php';
        require 'mongodb_delete.php';

        if (!isset($_SESSION['CREATED']))
        {
            $_SESSION['CREATED'] = time();
            require 'getToken.php';
        }
        else if (time() - $_SESSION['CREATED'] > 86400)
        {
            session_regenerate_id(true);
            $_SESSION['CREATED'] = time();
            require 'getToken.php';
        }

        if (isset($_SESSION["token"]))
        {

            require 'api_post.php';
            $data = include ('data.php');
            $config = include ('config.php');
            /*
            foreach ($csv as $row) { $array[] = trim($row[$col]); }
            
            foreach ($array as $url)  {
            */
            //echo "Starting " . $url . "<br />";

            if (substr($url, 0, 8) == "https://")
            {
                $url = substr($url, 8, strlen($url));
            }
            $pUrl = substr($url, 0, 255-8);
            $origUrl = $url;

            $url = substr($url, -255);
            $oUrl = $url;

            if ( $url == "www.canada.ca" )  {
                $oUrl = "www.canada.ca/home.html";
                $pUrl = "www.canada.ca/home.html";
            }

            $findEng = array('/en/', '/en.html');
            $findFra = array('/fr/', '/fr.html');

            include('lib/simple_html_dom.php');

            $html = file_get_html('https://'.$origUrl);

            foreach ($html->find('form') as $e) {
                if ($e->action && $e->name == 'cse-search-box') {
                    $searchURL = $e->action;
                    break;
                }
            }

            $oSearchURL = $searchURL;

            $searchURL = "www.canada.ca" . $searchURL;

            $searchURLFormat = str_replace(".","-",$searchURL);

            $globalSearchEn = "www.canada.ca/en/sr/srb.html";
            $globalSearchFr = "www.canada.ca/fr/sr/srb.html";

            if ( strposa($origUrl, $findEng) ) {
                $sUrl = "3135648695";
            } else if ( strposa($origUrl, $findFra) ) {
                $sUrl = "2498054421";
            }

            if ( $searchURL === $globalSearchEn || $searchURL === $globalSearchFr ) {
                $type = ["srchID", "prevp", "uvrap", "pltfrm", "trnd", "frwrd", "srchG", "prvs", "snm", "srch" ];
                $hasContextual = false;
            } else {
                if ( $origUrl == 'www.canada.ca' || $origUrl == 'www.canada.ca/home.html' ) {
                    $type = ["prevp", "uvrap", "pltfrm", "trnd", "frwrd", "prvs" ];
                    $hasContextual = false;
                } else {
                    $type = ["srchID", "prevp", "uvrap", "pltfrm", "trnd", "frwrd", "srchI", "srchG", "prvs", "snm", "srch" ];
                    $hasContextual = true;
                }
            }

            foreach ($dates as $key => $start)
            {
                $oDate = "$start/$end";

                if ($mode == "delete")
                {
                    mongoDelete($oUrl, $oDate);

                }
                else if ($mode == "update")
                {

                    //echo $key + 1 . " " . $oDate . "<br />";
                    foreach ($type as $t)
                    {

                        //echo "<br /><br />$t<br />$oDate<br /><br />";
                        $md = mongoGet($oUrl, $oDate, $t);
                        if ($md)
                        {
                            //echo ($md);
                            continue;
                        }

                        $prevpId = mongoGet($oUrl, $oDate, "prevpId");
                        $urlId = mongoGet($oUrl, $oDate, "urlId");
                        $searchID = mongoSearchGet($searchURLFormat);

                        if ( !($searchID) ) {
                            $array = array($start, $end, $searchURL);
                            $json = $data['uvrap'];
                            $json = vsprintf($json, $array);

                            $api = api_post($config['ADOBE_API_KEY'], $config['COMPANY_ID'], $_SESSION['token'], $json);

                            $api2 = json_decode($api);
                            $itemid = $api2->rows[0]->itemId;
                            
                            if ($itemid)
                            {
                                mongoSearchUpdate($searchURLFormat, $itemid);

                            }

                        }

                        //echo "<br />$searchID<br />";

                        $array = array( $start, $end );

                        if ($prevpId && ($t == "frwrd")) {
                            $array = array_merge( $array, array($prevpId) );
                        } else if ($prevpId && ($t == "srchI") && $hasContextual) {
                            $array = array_merge( $array, array($prevpId, $searchID, $searchID, $prevpId, $searchID) );
                        } else if ($prevpId && ($t == "srchG")) {
                            $array = array_merge( $array, array($prevpId, $sUrl, $sUrl, $prevpId, $sUrl) );
                        } else if ($urlId && ($t == "prvs")) {
                            $array = array_merge( $array, array($urlId) );
                        } else if ( $t == "prevp" ) {
                            $array = array_merge( $array, array($pUrl) );
                        } else if ( $t == "snm" ) {
                            if ($hasContextual)
                                $array = array_merge( $array, array($searchID, $pUrl) );
                            else
                                $array = array_merge( $array, array($sUrl, $pUrl) );
                        } else if ($prevpId && ($t == "srch") ) {
                            if ($hasContextual)
                                $array = array_merge( $array, array($prevpId, $searchID) );
                            else
                                $array = array_merge( $array, array($prevpId, $sUrl) );
                        } else {
                            $array = array_merge( $array, array($oUrl) );
                        }

                        if ($t == "trnd")
                        {
                            $iso = 'Y-m-d\TH:i:s.v';
                            $vstep = "day";
                            $date = dateRange($start, $end, $vstep);
                            if ($date[count($date) - 1] != $end)
                            {
                                array_push($date, $end);
                            }
                            $start2 = new DateTime($start);
                            $start2 = $start2->modify('-1 year')
                                ->format($iso);
                            $end2 = new DateTime($end);
                            $end2 = $end2->modify('-1 year')
                                ->format($iso);
                            $date2 = dateRange($start2, $end2, $vstep);
                            if ($date2[count($date2) - 1] != $end2)
                            {
                                array_push($date2, $end2);
                            }
                            $date3 = array_merge($date, $date2);
                            $cnt = count($date3) - 2;

                            $json = $data['trndB'] . rtrim(str_repeat($data['trndMA1'], $cnt) , ',') . $data['trndMS'] . rtrim(str_repeat($data['trndMA2'], $cnt) , ',') . $data['trndE'];

                            $arr = array();
                            for ($x = 1;$x < count($date);$x++)
                            {
                                $arr[] = (current($date) . "/" . next($date));
                            }
                            for ($x = 1;$x < count($date2);$x++)
                            {
                                $arr[] = (current($date2) . "/" . next($date2));
                            }

                            $id = range(0, $cnt - 1);
                            $filter = range(1, $cnt);

                            $arr1 = array_zip($filter, $id);
                            $arr2 = array_zip($id, $arr);
                            $dse = array_slice($date, 0, 2);

                            $dates2 = array_merge($dse, $arr1, $arr2);

                            $array = array_merge($dates2, array($oUrl));
                        }
                        else
                        {
                            $json = $data[$t];
                        }

                        $json = vsprintf($json, $array);

                        //echo "<br /><br />$t&nbsp;&nbsp;&nbsp;$start&nbsp;&nbsp;&nbsp;&nbsp;$end&nbsp;&nbsp;&nbsp;&nbsp;$oDate";

                        $api = api_post($config['ADOBE_API_KEY'], $config['COMPANY_ID'], $_SESSION['token'], $json);

                            //echo "<br />JSON:<br />$json<br />";
                            //echo "<br />API:<br />$api<br />";

                        $api2 = json_decode($api);
                        $itemid = $api2->rows[0]->itemId;

                        if ($t == "prevp" && $itemid)
                        {
                            mongoUpdate($oUrl, $oDate, "prevpId", $itemid);

                        }
                        else if ($t == "uvrap" && $itemid)
                        {
                            mongoUpdate($oUrl, $oDate, "urlId", $itemid);
                        }
                        

                        mongoUpdate($oUrl, $oDate, $t, $api);
                        
                    }

                }
            }
        }
    }
}
catch(Exception $ex)
{
    echo json_encode(array(
        'error' => $ex
    ));
}

/*

    $d = json_decode(file_get_contents('php://input'));

    $data = include('data.php');
    
    $type = $d->type;
    $url = $d->url;
    $date = $d->dates;
    $start = $date[0];
    $end = $date[1];

    $oDate = "$start/$end";
    $oUrl = $d->oUrl;
    
    require 'mongodb_get.php';
    $md = mongoGet($oUrl, $oDate, $type );
    if ($md) {
        echo ($md);
        return $md;
    }
    
    if ( $type == "trnd" ) { 
            $iso = 'Y-m-d\TH:i:s.v';
            $vstep = "day";
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

        require 'mongodb_update.php';
        mongoUpdate($oUrl, $oDate, $type, $api );
        
        echo ($api);
    } else {
        echo json_encode( array('error' => "No data") );
    }
    
} catch (Exception $ex) {
    echo json_encode( array('error' => $ex) );
}
*/

?>
