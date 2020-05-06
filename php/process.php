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

    }
    else if ((isset($start) && !empty($start)) && (isset($start) && !empty($start))) {
        $iso = 'Y-m-d\TH:i:s.v';
        $start = (new DateTime($start))->format($iso);
        $end = (new DateTime($end))->format($iso);

        $dates = [$start];
    }

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

            if ($mode == "update") {
                $md = mongoGet($oUrl, $oDate, $type);
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