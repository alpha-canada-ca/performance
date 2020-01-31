<?php

$iso = 'Y-m-d\TH:i:s.v';
$today = new DateTime("today");

$currentDate = array(
			$today->modify('-6 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso)
		);

$fromDate = $currentDate[0];
$toDate = $currentDate[6];
$today = new DateTime("today");

$previousDate = array(
			$today->modify('-6 week -1 year')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso),
			$today->modify('+1 week')->format($iso)
		);

$dates = array(
			$fromDate,
			$toDate,
			sprintf ("%s/%s", $currentDate[0], $currentDate[1]),
			sprintf ("%s/%s", $currentDate[1], $currentDate[2]),
			sprintf ("%s/%s", $currentDate[2], $currentDate[3]),
			sprintf ("%s/%s", $currentDate[3], $currentDate[4]),
			sprintf ("%s/%s", $currentDate[4], $currentDate[5]),
			sprintf ("%s/%s", $currentDate[5], $currentDate[6]),
			sprintf ("%s/%s", $previousDate[0], $previousDate[1]),
			sprintf ("%s/%s", $previousDate[1], $previousDate[2]),
			sprintf ("%s/%s", $previousDate[2], $previousDate[3]),
			sprintf ("%s/%s", $previousDate[3], $previousDate[4]),
			sprintf ("%s/%s", $previousDate[4], $previousDate[5]),
			sprintf ("%s/%s", $previousDate[5], $previousDate[6])
		);

?>
