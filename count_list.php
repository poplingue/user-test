<?php
$fi = new FilesystemIterator('output/chart/');
print iterator_count($fi) - 1;
?>
  
