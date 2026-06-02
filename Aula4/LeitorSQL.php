<?php
class LeitorSQL
{
    private $conteudo;
    private $tabelas = [];
    public function __construct($arquivo)
    {
        if (!file_exists($arquivo)) {
            throw new Exception("Arquivo não encontrado.");
        }
        $this->conteudo = file_get_contents($arquivo);
        $this->processarTabelas();
    }
    private function processarTabelas()
    {
        preg_match_all(
            '/CREATE TABLE `(.+?)` \((.*?)\)\s*ENGINE=/s',
            $this->conteudo,
            $matches,
            PREG_SET_ORDER
        );
        foreach ($matches as $match) {
            $nomeTabela = $match[1];
            $camposTexto = $match[2];
            $this->tabelas[$nomeTabela] = [];
            $linhas = explode("\n", $camposTexto);
            foreach ($linhas as $linha) {

                $linha = trim($linha);
                if (strpos($linha, '`') !== 0) {
                    //  if (!str_starts_with($linha, '`')) {
                    continue;
                }
                // linha=`id` int(11) NOT NULL,
                preg_match('/`(.+?)`\s+([a-zA-Z0-9()]+)/', $linha, $campo);
                $nomeCampo = $campo[1] ?? '';
                $tipoCampo = $campo[2] ?? '';
                $this->tabelas[$nomeTabela][$nomeCampo] = [
                    'tipo' => $tipoCampo,
                    'primary' => false
                ];
            }
        }
        preg_match_all(
            '/ALTER TABLE `(.+?)`(.*?)ADD PRIMARY KEY \(`(.+?)`\)/s',
            $this->conteudo,
            $primaryMatches,
            PREG_SET_ORDER
        );
        foreach ($primaryMatches as $match) {
            $tabela = $match[1];
            $campoPK = $match[3];
            if (isset($this->tabelas[$tabela][$campoPK])) {
                $this->tabelas[$tabela][$campoPK]['primary'] = true;
            }
        }
         /*ALTER TABLE `aluno`
          ADD CONSTRAINT `aluno_curso` FOREIGN KEY (`idcurso`) REFERENCES `curso` (`id`);*/

        preg_match_all(
            '/ALTER TABLE `([^`]+)`\s+ADD CONSTRAINT `[^`]+`\s+
            FOREIGN KEY \(`([^`]+)`\)\s+REFERENCES `([^`]+)` \(`([^`]+)`\)/',
            $this->conteudo,
            $estrangeira,
            PREG_SET_ORDER
        );
       print "<pre>";
        foreach($estrangeira as $fk){
            print "Tabela FK: " . $fk[1] . "\n";
            print "Campo FK: " . $fk[2] . "\n";
            print "Tabela Referenciada: " . $fk[3] . "\n";
            print "Campo Referenciado: " . $fk[4] . "\n\n";
        }
        print "</pre>";
    }
    function converterTipoPHP(string $tipoSQL): string
    {
        $tipoSQL = strtolower($tipoSQL);
        $tipoSQL = preg_replace('/\(.*\)/', '', $tipoSQL);
        return match($tipoSQL){
            'int', 'bigint', 'smallint', 'tinyint' => 'int',
            'varchar', 'char', 'text', 'longtext' => 'string',
            'decimal', 'float', 'double' => 'float',
            'date', 'datetime', 'timestamp' => 'string',
            'bool', 'boolean' => 'bool',
            default => 'mixed'
        };
    }
 public function getTabelas()  {
        return array_keys($this->tabelas);
    }
    public function getAtributos($tabela) {
        if (!isset($this->tabelas[$tabela])) {
            return [];
    }
        return $this->tabelas[$tabela];
    }
}
?>
