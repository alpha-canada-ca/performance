<?php

try {
    $d = json_decode(file_get_contents('php://input'));

    $data = include ('data.php');

    $url = $d->oUrl;
    $date = $d->dates;
    $type = $d->type;
    $field =  $d->field;
    $start = $date[0];
    $end = $date[1];

    $mode = (empty($_REQUEST["mode"])) ? "update" : $_REQUEST["mode"];

    $today = new DateTime("today");

    if ($field == "aa") {
        $iso = 'Y-m-d\TH:i:s.v';
        $end = $today->format($iso);
    } else {
        $iso = 'Y-m-d';
        $end = (new DateTime($end))->format($iso);
    }
    $start = (new DateTime($start))->format($iso);    

    $yesterday = $today->modify('-1 day')
        ->format($iso);
    $week = $today->modify('-6 day')
        ->format($iso);
    $month = $today->modify('-23 day')
        ->format($iso);

    $dates2 = [$month, $week, $yesterday];

    $dates = [$start];

    if ((isset($url) && !empty($url))) {

        require_once('mongodb_get.php');
        $origUrl = $url;

        if (substr($url, 0, 8) == "https://") {
            $url = substr($url, 8, strlen($url));
        }
        $pUrl = substr($url, 0, 255 - 8);

        $url = substr($url, -255);
        $oUrl = $url;

        if ($url == "www.canada.ca") {
            $oUrl = "www.canada.ca/home.html";
            $pUrl = "www.canada.ca/home.html";
        }

        foreach ($dates as $key => $start) {
            if ($field == "aa") {
                $oDate = "$start/$end";
            } else {
                $oDate = "$start/$end";
            }

            if ( $type == "activityMap" || $type == "metrics" || $type == "srchAll" || $type == "refType" || $type == "snmAll" || $type == "srchLeftAll" || $type == "fwylf" || $type == "prvs" || $type == "trnd") {
                $oDate = $dates2[0] . "/" . $end;
                $sm = "multi";
            } else {
                $sm = "single";
            }
            if ($mode == "update") {
                if ($field == "aa") {
                    $md = mongoGet($oUrl, $oDate, $type, $sm);
                } else {
                    $md = mongoGet($origUrl, $oDate, $type, "multi");
                }
                if ($md) {
                    echo ($md);
                    return;
                }
            }
        }
    }
}
catch(Exception $ex) {
    echo json_encode(array('error' => $ex));
}

?>