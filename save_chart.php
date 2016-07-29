<?php

$post_data = $_POST['data'];
$fi = new FilesystemIterator('output/chart/');

$content = json_decode($post_data);
$my_file = 'output/chart/chart_'.iterator_count($fi).'.json';
$handle = fopen($my_file, 'w') or die('Cannot open file:  '.$my_file); //implicitly creates file
fwrite($handle, $post_data);

?>