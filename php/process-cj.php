<?php
session_start();
ini_set('display_errors', 1);


function dateRange($first, $last, $step, $format = 'Y-m-d\TH:i:s.v')
{
    $dates = [];
    $step = '+1 ' . $step;
    $current = strtotime($first);
    $last = strtotime($last);

    while ($current <= $last) {

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

function strposa($haystack, $needle, $offset = 0)
{
    if (!is_array($needle))
        $needle = array($needle);
    foreach ($needle as $query) {
        if (strpos($haystack, $query, $offset) !== false)
            return true; // stop on first true result
    }
    return false;
}

try {
    $data = include('data.php');

    $url = $_REQUEST["url"];
    $start = $_REQUEST["start"];
    $end = $_REQUEST["end"];
    $oLang = $_REQUEST["lang"];

    $mode = (empty($_REQUEST["mode"])) ? "update" : $_REQUEST["mode"];

    if ((!isset($start) && empty($start)) && (!isset($end) && empty($empty))) {
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

        var_dump($dates);

    } else if ((isset($start) && !empty($start)) && (isset($end) && !empty($end))) {
        $iso = 'Y-m-d\TH:i:s.v';
        $start = (new DateTime($start))->format($iso);
        $end = (new DateTime($end))->format($iso);

        $dates = [$start];
        /*
        $iso = 'Y-m-d\TH:i:s.v';
        $start = (new DateTime($start))->format($iso);
        $end = (new DateTime($end));
        $end2 = $end;
        $end2 = ($end2->modify('+1 day'))->format($iso);

        $yesterday = $end->modify('-1 day')
            ->format($iso);
        $week = $end->modify('-6 day')
            ->format($iso);
        $month = $end->modify('-23 day')
            ->format($iso);

        $end = $end2;

        $dates = [$month, $week, $yesterday];
        */
    }

    if ((isset($url) && !empty($url))) {

        /*
        $csv = array_map('str_getcsv', file('file.csv' , FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));
        
        $header = array_shift($csv);
        
        $col = array_search("URL", $header);
        */

        require_once('mongodb_update.php');
        require_once('mongodb_get.php');
        require_once('mongodb_delete.php');

        if (!isset($_SESSION['CREATED'])) {
            $_SESSION['CREATED'] = time();
            require_once('getToken.php');
        } else if (time() - $_SESSION['CREATED'] > 86400) {
            session_regenerate_id(true);
            $_SESSION['CREATED'] = time();
            require_once('getToken.php');
        }

        if (isset($_SESSION["token"])) {

            require_once('api_post.php');
            $data = include('data.php');
            $config = include('config.php');
            /*
            foreach ($csv as $row) { $array[] = trim($row[$col]); }
            
            foreach ($array as $url)  {
            */
            //echo "Starting " . $url . "<br />";

            include('lib/simple_html_dom.php');

            if (substr($url, 0, 8) == "https://") {
                $url = substr($url, 8, strlen($url));
            }
            $html = file_get_html('https://' . $url);

            if ($oLang) {
                foreach ($html->find('a') as $e) {
                    if (
                        ($e->lang == "en" || $e->lang == "fr") &&
                        (trim($e->innertext) == "English" || trim($e->innertext) == "Fran&ccedil;ais")
                    ) {
                        $otherLang = $e->href;
                        break;
                    }
                }

                $url = "www.canada.ca" . $otherLang;
            }

            //echo $url;

            $html = file_get_html('https://' . $url);

            if (substr($url, 0, 8) == "https://") {
                $url = substr($url, 8, strlen($url));
            }
            $pUrl = substr($url, 0, 255 - 8);
            $origUrl = $url;

            $url = substr($url, -255);
            $oUrl = $url;

            if ($url == "www.canada.ca") {
                $oUrl = "www.canada.ca/home.html";
                $pUrl = "www.canada.ca/home.html";
            }

            $bUrl = substr('https://' . $origUrl, 0, 255);
            $html = file_get_html('https://' . $origUrl);

            foreach ($html->find('form') as $e) {
                if ($e->action && $e->name == 'cse-search-box') {
                    $searchURL = $e->action;
                    break;
                }
            }

            foreach ($html->find('title') as $e) {
                $titlePage = $e->innertext;
                break;
            }

            $titlePage = trim($titlePage);
            $titlePage = str_replace('&amp;', '', $titlePage);
            $titlePage = str_replace('&nbsp;', ' ', $titlePage);
            $titlePage = str_replace('<br>', '', $titlePage);
            $titlePage = str_replace('<br/>', '', $titlePage);
            $titlePage = str_replace('<br />', '', $titlePage);
            $titlePage = str_replace(' - Canada.ca', '', $titlePage);

            #echo $html;
            $api = array();
            $oSearchURL = $searchURL;

            $searchURL = "www.canada.ca" . $searchURL;

            $searchURLFormat = str_replace(".", "-", $searchURL);

            $globalSearchEn = "www.canada.ca/en/sr/srb.html";
            $globalSearchFr = "www.canada.ca/fr/sr/srb.html";

            if ($searchURL === $globalSearchEn || $searchURL === $globalSearchFr) {
                $type = ["trnd", "prvs", "srchAll", "refType", "snmAll", "srchLeftAll", "activityMap", "metrics", "fwylf"];
                $hasContextual = false;
            } else {
                if ($origUrl == 'www.canada.ca' || $origUrl == 'www.canada.ca/home.html') {
                    $type = ["trnd", "prvs", "activityMap", "refType", "metrics", "fwylf"];
                    $hasContextual = false;
                } else {
                    $type = ["trnd", "prvs", "srchAll", "refType", "snmAll", "srchLeftAll", "activityMap", "metrics", "fwylf"];
                    $hasContextual = true;
                }
            }

            foreach ($dates as $key => $start) {
                $oDate = "$start/$end";

                if ($mode == "delete") {
                    mongoDelete($oUrl, "cache");

                } else if ($mode == "update") {

                    //echo $key + 1 . " " . $oDate . "<br />";
                    foreach ($type as $t) {
                        $sm = "single";
                        if ($t == "activityMap" || $t == "metrics" || $t == "srchAll" || $t == "refType" || $t == "snmAll" || $t == "srchLeftAll" || $t == "fwylf" || $t == "prvs" || $t == "trnd") {
                            $oDate = $dates[0] . "/" . $end;
                            $sm = "multi";
                        }
                        //echo "<br /><br />$t<br />$oDate<br /><br />";
                        $md = mongoGet($oUrl, $oDate, $t, $sm, "cache");
                        if ($md) {
                            //echo ($md);
                            continue;
                        }

                        $array = array($start, $end);

                        if ($t == "srchAll") {
                            $array = array_merge(array($bUrl), $dates);
                        } else if ($t == "refType") {
                            $array = array_merge(array($oUrl), $dates);
                        } else if ($t == "fwylf") {
                            $array = array_merge(array($oUrl), $dates);
                        } else if ($t == "prvs") {
                            $array = array_merge(array($oUrl), $dates);
                        } else if ($t == "activityMap") {
                            $array = array_merge(array($titlePage), $dates);
                        } else if ($t == "snmAll") {
                            $array = array_merge(array($searchURL), $dates, array($bUrl));
                        } else if ($t == "srchLeftAll") {
                            $array = array_merge(array($searchURL, $bUrl), $dates);
                        } else if ($t == "metrics") {
                            $array = array($oUrl);
                        } else {
                            $array = array_merge($array, array($oUrl));
                        }

                        if ($t == "trnd") {
                            $iso = 'Y-m-d\TH:i:s.v';
                            $vstep = "day";
                            $start = $dates[0];
                            $date = dateRange($start, $end, $vstep);
                            if ($date[count($date) - 1] != $end) {
                                array_push($date, $end);
                            }

                            $end2 = new DateTime($end);
                            $end2 = $end2->modify('-1 year');
                            $end3 = $end2->format($iso);

                            $start2 = $end2->modify('-30 day')
                                ->format($iso);
                            $end2 = $end3;

                            $date2 = dateRange($start2, $end2, $vstep);
                            if ($date2[count($date2) - 1] != $end2) {
                                array_push($date2, $end2);
                            }
                            $date3 = array_merge($date, $date2);
                            $cnt = count($date3) - 2;

                            $json = $data['trndB'] . rtrim(str_repeat($data['trndMA1'], $cnt), ',') . $data['trndMS'] . rtrim(str_repeat($data['trndMA2'], $cnt), ',') . $data['trndE'];

                            $arr = array();
                            for ($x = 1; $x < count($date); $x++) {
                                $arr[] = (current($date) . "/" . next($date));
                            }
                            for ($x = 1; $x < count($date2); $x++) {
                                $arr[] = (current($date2) . "/" . next($date2));
                            }

                            $id = range(0, $cnt - 1);
                            $filter = range(1, $cnt);

                            $arr1 = array_zip($filter, $id);
                            $arr2 = array_zip($id, $arr);
                            $dse = array_slice($date, 0, 2);

                            $dates2 = array_merge($dse, $arr1, $arr2);

                            $array = array_merge($dates2, array($oUrl));
                        } else {
                            $json = $data[$t];
                        }

                        $json = vsprintf($json, $array);
                        if ($t == "activityMap" || $t == "metrics" || $t == "srchAll" || $t == "refType" || $t == "snmAll" || $t == "srchLeftAll" || $t == "fwylf" || $t == "prvs") {
                            $json = str_replace("2020-05-16T00:00:00.000", $end, $json);
                            //echo $json;
                        }
                        if ($t == "metrics") {
                            $json = str_replace("*month*", $dates[0], $json);
                            $json = str_replace("*week*", $dates[1], $json);
                            $json = str_replace("*yesterday*", $dates[2], $json);
                            //echo $json;
                        }

                        echo "<br /><br />$t&nbsp;&nbsp;&nbsp;$start&nbsp;&nbsp;&nbsp;&nbsp;$end&nbsp;&nbsp;&nbsp;&nbsp;$oDate";

                        $api[] = $json;

                        echo "<br />JSON:<br />$json<br />";

                        //$api2 = json_decode($api);

                        /*
                        if ($api2->error_code) {
                            sleep(4);

                            $api = api_post($config['ADOBE_API_KEY'], $config['COMPANY_ID'], $_SESSION['token'], $json);

                            //echo "<br />JSON:<br />$json<br />";
                            //echo "<br />API:<br />$api<br />";

                            $api2 = json_decode($api);
                        }

/*
                        while ( !$api2->error_code ) {

                            sleep(2);

                            $api = api_post($config['ADOBE_API_KEY'], $config['COMPANY_ID'], $_SESSION['token'], $json);

                            //echo "<br />JSON:<br />$json<br />";
                            //echo "<br />API:<br />$api<br />";

                            $api2 = json_decode($api);
                        }
                        */

                        /*
                        $itemid = $api2->rows[0]->itemId;

                        if ($t == "prevp" && $itemid)
                        {
                            mongoUpdate($oUrl, $oDate, "prevpId", $itemid, $sm);

                        }
                        */


                        //mongoUpdate($oUrl, $oDate, $t, $api, $sm);

                    }

                }
            }
        }
    }
} catch (Exception $ex) {
    echo json_encode(
        array(
            'error' => $ex
        )
    );
}

$result = api_post($config[$_SESSION['randIndex']]['ADOBE_API_KEY'], $config[$_SESSION['randIndex']]['COMPANY_ID'], $_SESSION['token'], $api);

foreach ($result as $r => $res) {
    mongoUpdate($oUrl, $oDate, $type[$r], $res, "multi", "cache");
}

?>