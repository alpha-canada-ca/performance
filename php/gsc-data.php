<?php

return array(
    'qryAll' => '{"startDate":"%s","endDate":"%s","dimensions":["query"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"}]}],"searchType":"web","rowLimit":%d}',
    'qryMobile' => '{"startDate":"%s","endDate":"%s","dimensions":["query"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"},{"dimension": "device","expression": "mobile"}]}],"searchType":"web","rowLimit":%d}',
    'qryDesktop' => '{"startDate":"%s","endDate":"%s","dimensions":["query"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"},{"dimension": "device","expression": "desktop"}]}],"searchType":"web","rowLimit":%d}',
    'qryTablet' => '{"startDate":"%s","endDate":"%s","dimensions":["query"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"},{"dimension": "device","expression": "tablet"}]}],"searchType":"web","rowLimit":%d}',
    'totals' => '{"startDate":"%s","endDate":"%s","dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"}]}],"searchType":"web","rowLimit":%d}',
    'totalDate' => '{"startDate":"%s","endDate":"%s","dimensions":["date"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"}]}],"searchType":"web","rowLimit":%d}',
    'cntry' => '{"startDate":"%s","endDate":"%s","dimensions":["country"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"}]}],"searchType":"web","rowLimit":%d}',
    'totalDateTest' => '{"startDate":"%s","endDate":"%s","dimensions":["date"],"dimensionFilterGroups":[{"filters":[{"dimension":"page","operator":"equals","expression":"%s"}]}],"searchType":"web","rowLimit":%d}',
);

?>
