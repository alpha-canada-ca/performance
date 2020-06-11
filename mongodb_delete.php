<?php

function mongoDelete ( $url ) {
    try {

        $mng = new MongoDB\Driver\Manager("mongodb://mongodb:27017");
        $bulk = new MongoDB\Driver\BulkWrite;
        $filter = [ 'url' => $url ]; 
        $bulk->delete($filter);

        $mng->executeBulkWrite('pageperformance.cache', $bulk);

    }  catch (MongoDB\Driver\Exception\Exception $e) {

        $filename = basename(__FILE__);
        
        $arr = array('error' => "The " . $filename . " script has experienced an error.\nIt failed with the following exception:\nException:" . $e->getMessage() . "\n
            In file:" . $e->getFile() . "\n
            On line:" . $e->getLine() . "\n" );
        echo (json_encode( $arr ));      
    }

}

?>