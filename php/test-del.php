<?php

ini_set('display_errors', 1);
require_once('mongodb_delete.php');

$oUrl = "www.canada.ca/en/revenue-agency.html";
$type = "prvs";
$oMd = '{"error":"error is here", "message":"meessagee"}';
$date = "2020-12-28T00:00:00.000/2021-01-26T00:00:00.000";

mongoDelete($oUrl, "search");

?>