<?php
include ("banco.php");

function buscarTabelas($entidades){
  return $entidades["nome"];
}

function buscarAtributos($entidade){
  global $atributos;
  return $atributos[$entidade];
}



?>
