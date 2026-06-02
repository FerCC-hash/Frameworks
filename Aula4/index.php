<?php
include ("LeitorSQL.php");

function criarClasse($arquivoSQL){
    if (!is_dir("model")) {
        mkdir("model" , 0777, true);
    }

    $objSQL = new LeitorSQL($arquivoSQL);

    $entidades = $objSQL->getTabelas();
    foreach ($entidades as $e) {
        $listaAtributos = $objSQL->getAtributos($e);
        $atr = "";
        $metodos = "";
        $magico = "";
        foreach ($listaAtributos as $key => $atributos) {
            $tipoPHP = $objSQL->converterTipoPHP($atributos["tipo"]);
            $atr .= "private " . $tipoPHP . " $" . $key . ";\n\t";
            
            $metodos .= "public function get" . ucfirst($key) . "() : " . $tipoPHP . "{\n";
            $metodos .= "    return \$this->$key;\n}\n\n";
            
            $metodos .= "public function set" . ucfirst($key) . "(\$$key): self {\n";
            $metodos .= "    \$this->$key = \$$key;\n    return \$this;\n}\n\n";

            $magico .= "echo \"$key :\". \$this->$key . \"<br>\"; \n";
        }
        $nomeClasse = ucfirst($e);
        $conteudo = <<<CLASS
        <?php
        class $nomeClasse {
            $atr
        $metodos
        public function __toString() {
            return "{$this->$magico}";
        }
        }
        CLASS;

        file_put_contents("model/" . $e . ".php", $conteudo);
    }
    
    return $entidades;
}

// Processar upload do arquivo
$mensagem = "";
$dadosTabela = null;
$nomeTabelaSelecionada = "";
$tabelas = [];
$arquivoProcessado = false;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
}