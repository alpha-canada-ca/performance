<?php
ini_set('display_errors', 0);
ini_set('error_reporting', E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED & ~E_STRICT);
/*
 * Copyright 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

include_once __DIR__ . '/lib/google-api-php-client/vendor/autoload.php';

require_once('mongodb_update.php');
require_once('mongodb_get.php');

$results = 100;

$data = include('gsc-data.php');

$d = json_decode(file_get_contents('php://input'));

require __DIR__ . '/lib/country_en-fr.php';

// example query
/*
$url = "https://www.canada.ca/en/public-health/services/diseases/coronavirus-disease-covid-19.html";
$date = [ "7daysago", "yesterday" ];
$lang = "en";
*/

$rangeStartToEnd = $d->oRangeStartToEnd; // the range between the start date and end date
$rangeEndToToday = $d->oRangeEndToToday; // the range between the end date and today
$days = $d->day;
$date = $d->dates;
$date = [($rangeStartToEnd + $rangeEndToToday . "daysago"), ($rangeEndToToday + 1 . "daysago")]; // [start date, end date]
$url = $d->oUrl;
$start = $date[0];
$end = $date[1];
$oLang = $d->lang;

//echo $start;

if ((isset($start) && !empty($start)) && (isset($end) && !empty($end))) {
  $iso = 'Y-m-d';

  $start = (new DateTime($start))->format($iso);
  $end = (new DateTime($end))->format($iso);
}

$type = ['totalDateTest', 'cntry', 'qryAll', 'qryMobile', 'qryDesktop', 'qryTablet', 'totals', 'totalDate'];

include('lib/simple_html_dom.php');

$html = file_get_html($url);

if ($oLang) {
  foreach ($html->find('a') as $e) {
    if (
      ($e->lang == "en" || $e->lang == "fr") &&
      ((strpos(trim($e->innertext), 'English') !== false) || (strpos(trim($e->innertext), 'Fran&ccedil;ais') !== false) ||
        (strpos(trim($e->innertext), 'Français') !== false))
    ) {
      $otherLang = $e->href;
      break;
    }
  }

  $url = "https://www.canada.ca" . $otherLang;
}

$myObj = (object) [];

$analytics = initializeAnalytics();

foreach ($type as $t) {
  if ($t == "totalDateTest") {
    $response = getReport($start, $end, $results, $url, $t);
    $u = printResults($analytics, $response, $t);
    $date = new DateTime($u);
    $end = $date->format($iso);

    if ($days == 4) {
      $start = $end;
    } else {
      $start = (new DateTime($start))->format($iso);
    }

    $dates = "$start/$end";

  } else {
    $md = mongoGet($url, $dates, $t, "multi", "search", "bi");
    if ($md) {
      continue;
    }
    $response = getReport($start, $end, $results, $url, $t);
    $u = printResults($analytics, $response, $t);
    mongoUpdate($url, $dates, $t, $u, "multi", "search", "bi");
  }
}

$myObj->start = $start;
$myObj->end = $end;
$myObj->url = $url;
$myJSON = json_encode($myObj);
echo $myJSON;

/**
 * Initializes an Analytics Reporting API V4 service object.
 *
 * @return An authorized Analytics Reporting API V4 service object.
 */
function initializeAnalytics()
{

  // Use the developers console and download your service account
  // credentials in JSON format. Place them in this directory or
  // change the key file location if necessary.
  $KEY_FILE_LOCATION = __DIR__ . '/service-account-credentials.json';

  // Create and configure a new client object.
  $client = new Google_Client();
  $client->setAuthConfig($KEY_FILE_LOCATION);
  $client->setScopes(['https://www.googleapis.com/auth/webmasters.readonly']);

  return $client;
}


/**
 * Queries the Analytics Reporting API V4.
 *
 * @param service An authorized Analytics Reporting API V4 service object.
 * @return The Analytics Reporting API V4 response.
 */
function getReport($start, $end, $results, $url, $t)
{

  global $data;
  $json = $data[$t];
  $json = sprintf($json, $start, $end, $url, $results);
  $array = json_decode($json, true);

  return new Google_Service_Webmasters_SearchAnalyticsQueryRequest($array);

}

/**
 * Queries the Analytics Reporting API V4.
 *
 * @param service An authorized Analytics Reporting API V4 service object.
 * @return The Analytics Reporting API V4 response.
 */
function getReportTest($start, $end, $results, $url, $t)
{

  global $data;
  $json = $data[$t];
  $json = sprintf($json, $url, $results);
  echo $json;
  $array = json_decode($json, true);

  return new Google_Service_Webmasters_SearchAnalyticsQueryRequest($array);

}


/**
 * Parses and prints the Analytics Reporting API V4 response.
 *
 * @param An Analytics Reporting API V4 response.
 */
function printResults($client, $q, $t)
{

  try {

    $service = new Google_Service_Webmasters($client);
    $u = $service->searchanalytics->query('https://www.canada.ca/', $q);

    if ($t == "cntry") {
      foreach ($u->rows as $k => $v) {
        $keys = $v["keys"][0];
        $rept = search_country(array('alpha3' => $keys));
        $rep = $rept["name"];
        $rep2 = $rept["namefr"];
        $u->rows[$k]->keys[0] = $rep;
        $u->rows[$k]->keys[1] = $rep2;
      }
    } elseif ($t == 'totalDateTest') {
      if ($u->rows) {
        foreach ($u->rows as $k => $v) {
          end($u->rows);

          if ($k === key($u->rows))
            return $v['keys'][0];
        }
      }
      return;
    }

    return json_encode($u);

  } catch (\Exception $e) {
    echo $e->getMessage();
  }

}

//  returns an array with the sought country's data if the search yields a result
//  returns false if no results could be found or if argument is incorrect
function search_country($query)
{

  // make the countries available in the function
  global $countries;

  // if argument is not valid return false
  if (!isset($query['id']) && !isset($query['alpha2']) && !isset($query['alpha3']))
    return false;

  // iterate over the array of countries
  $result = array_filter($countries, function ($country) use ($query) {

    // return country's data if
    return (
        // we are searching by ID and we have a match
      (isset($query['id']) && $country['id'] == $query['id'])
      // or we are searching by alpha2 and we have a match
      || (isset($query['alpha2']) && $country['alpha2'] == strtolower($query['alpha2']))
      // or we are searching by alpha3 and we have a match
      || (isset($query['alpha3']) && $country['alpha3'] == strtolower($query['alpha3']))
    );

  });

  // since "array_filter" returns an array we use pop to get just the data object
  // we return false if a result was not found
  return empty($result) ? false : array_pop($result);

}

?>