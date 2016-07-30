<?php

$data = json_decode(file_get_contents("php://input"));

//count how much chart already created
$fi = new FilesystemIterator('output/chart/');
$filename = 'output/chart/chart_'.iterator_count($fi).'.json';

$fp = fopen($filename,'w');
fwrite($fp, json_encode($data));
fclose($fp);

var_dump($data);

?>