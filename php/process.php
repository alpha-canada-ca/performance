<?php

try {
    $d = json_decode(file_get_contents('php://input'));

    $data = include ('data.php');

    $url = $d->oUrl;
    $date = $d->dates;
    $type = $d->type;
    $start = $date[0];
    $end = $date[1];

    $mode = (empty($_REQUEST["mode"])) ? "update" : $_REQUEST["mode"];

    $iso = 'Y-m-d\TH:i:s.v';
    $start = (new DateTime($start))->format($iso);
    $today = new DateTime("today");
    $end = $today->format($iso);

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

        foreach ($dates as $key => $start) {
            $oDate = "$start/$end";

            if ( $type == "activityMap" || $type == "metrics" ) {
                $oDate = $dates2[0] . "/" . $end;
                $sm = "multi";
            } else {
                $sm = "single";
            }
            if ($mode == "update") {
                $md = mongoGet($oUrl, $oDate, $type, $sm);
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