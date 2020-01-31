<?php

try {
    $url = trim($_REQUEST["url"]);

    if ( (isset($url) && !empty($url)) ) {
		$csv = array_map('str_getcsv', file('file.csv' , FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES));

		array_walk($csv, function(&$a) use ($csv) {
		    $a = array_combine($csv[0], $a);
		    $a['URL'] = substr(trim($a['URL']), -255);
		});
		array_shift($csv);

		$key = array_search($url, array_column($csv, 'URL'));

		if ( !is_numeric($key) ) {
		    $json = json_encode( array('error' => "No data") );
		} else {
		    $json = json_encode($csv[$key]);
		}

		header('Content-Type: application/json');
		echo $json;
    } else {
        echo json_encode( array('error' => "No data") );
    }
} catch (Exception $ex) {
    echo json_encode( array('error' => $ex) );
}
?>
