<?php

function mongoSearchUpdate ( $type, $data ) {
    try {

        $mng = new MongoDB\Driver\Manager("mongodb://mongodb:27017");
        $bulk = new MongoDB\Driver\BulkWrite;
        $filter = [ 'type' => 'search' ]; 
        $query = new MongoDB\Driver\Query($filter);

        $res = $mng->executeQuery('pageperformance.cache', $query);
        $result = current($res->toArray());
    
        if ( !empty($result) ) {
            $upd = $bulk->update($filter, ['$set' => [$type => $data]]);
            $mng->executeBulkWrite('pageperformance.cache', $bulk);
        } else {
            $ins = [
                '_id' => new MongoDB\BSON\ObjectID,
                'type' => 'search',
                $type => $data
            ];

            $bulk->insert($ins);
            $mng->executeBulkWrite('pageperformance.cache', $bulk);
        }

    }  catch (MongoDB\Driver\Exception\Exception $e) {

        $filename = basename(__FILE__);
        
        $arr = array('error' => "The " . $filename . " script has experienced an error and has failed with the following exception\nException:" . $e->getMessage() . "\n
            In file:" . $e->getFile() . "\n
            On line:" . $e->getLine() . "\n" );
        return (json_encode( $arr )); 
    }

}

?>