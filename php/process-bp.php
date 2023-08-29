<?php
ini_set('display_errors', 1);
require_once('mongodb_update.php');
require_once('mongodb_get.php');
require_once('lib/simple_html_dom.php');
$d = json_decode(file_get_contents('php://input'));

$date = $d->dates;
$url = $d->oUrl;
$start = $date[0];
$end = $date[1];
$oLang = $d->lang;
//$url = "https://www.canada.ca/en/public-health/services/diseases/2019-novel-coronavirus-infection/symptoms.html";
//$date = [ "7daysago", "yesterday" ];
//$lang = "en";


if ((isset($start) && !empty($start)) && (isset($end) && !empty($end))) {
  $iso = 'Y-m-d';
  $start = (new DateTime($start))->format($iso);
  $end = (new DateTime($end))->format($iso);
}
$dates = "$start/$end";
$byPageURL = 'https://feedback-by-page.tbs.alpha.canada.ca/bypage?page=' . $url . '&start_date=' . $start . '&end_date=' . $end . '&lang=' . $oLang;
$md = mongoGet($byPageURL, $dates, 'html', 'multi', "search", "bi");
$output = '';
if ($md) {
  $output = $md;
} else {
  try {
    $html = file_get_html($byPageURL);
    $output = $html->getElementById('content');
    $output = $output->innertext();
    $output = json_encode($output);
    $output = '{ "html":' . ' ' . $output . '}';
    mongoUpdate($byPageURL, $dates, 'html', $output, "multi", "search", "bi");
  } catch (Throwable $e) {
    $output = "no data";
  }
}
$pos = strpos($output, 'no data');
if ($pos === false) {
  echo $output;
} else {
  echo '{"html": "No data"}';
}
?>