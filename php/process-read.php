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
  $end = (new DateTime($end))->format($iso);
}
$dates = "$start/$end";
$byPageURL = 'https://readability-lisibilite.tbs.alpha.canada.ca/read_score?url=' . $url . '&lang=' . $oLang;
$md = mongoGet($byPageURL, $end, 'html', 'multi', "search", "bi");
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
    mongoUpdate($byPageURL, $end, 'html', $output, "multi", "search", "bi");
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