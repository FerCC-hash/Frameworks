//versao que possui o colspan
let tabelas = document.getElementsByTagName("tabela");

for (let i = 0; i < tabelas.length; i++) {
    let tabelaAtual = tabelas[i];
    let linhas = parseInt(tabelaAtual.getAttribute("linha"));
    let colunas = parseInt(tabelaAtual.getAttribute("coluna"));
    let novaTabela = document.createElement("table");
    
    let expands = tabelaAtual.getElementsByTagName("expand");
    let expandsInfo = [];
    
    for (let e = 0; e < expands.length; e++) {
        expandsInfo.push({
            linha: parseInt(expands[e].getAttribute("linha")),
            coluna: parseInt(expands[e].getAttribute("coluna")),
            tamanho: parseInt(expands[e].getAttribute("tamanho")),
            tipo: expands[e].getAttribute("tipo")
        });
    }

    let bordaAttr = tabelaAtual.getAttribute("borda");
    if (bordaAttr) {
        let vetBorda = bordaAttr.split(" ");
        novaTabela.style.setProperty('--tamanho-borda', vetBorda[0]);
        novaTabela.style.setProperty('--tipo-borda', vetBorda[1]);
        novaTabela.style.setProperty('--cor-borda', vetBorda[2]);
    }

    // Cria matriz "ocupado" com dimensões linhas x colunas, preenchida com false (indica células disponíveis)
    let ocupado = Array(linhas).fill().map(() => Array(colunas).fill(false));
    
    // Para cada expand, marca as células que serão ocupadas por rowspan ou colspan
    for (let exp of expandsInfo) {
        
        if (exp.tipo === "linha") { // rowspan
            // Marca as linhas abaixo da célula atual que serão ocupadas pelo rowspan
            for (let l = 1; l < exp.tamanho; l++) {
                if (exp.linha + l < linhas) { // verifica se não ultrapassa o limite de linhas
                    ocupado[exp.linha + l][exp.coluna] = true; // célula ocupada
                }
            }
        } else if (exp.tipo === "coluna") { // colspan
            // Marca as colunas à direita da célula atual que serão ocupadas pelo colspan
            for (let c = 1; c < exp.tamanho; c++) {
                if (exp.coluna + c < colunas) { // verifica se não ultrapassa o limite de colunas
                    ocupado[exp.linha][exp.coluna + c] = true; // célula ocupada
                }
            }
        }
    }

    // Constrói a tabela percorrendo cada célula
    for (let linha = 0; linha < linhas; linha++) {
        let tr = document.createElement("tr");

        for (let coluna = 0; coluna < colunas; coluna++) {
            // Se a célula não estiver ocupada por uma expansão anterior, cria-se uma nova célula
            if (!ocupado[linha][coluna]) {
                let td = document.createElement("td");
                // Verifica se há um expand exatamente nesta posição
                let expandAtual = expandsInfo.find(e => e.linha === linha && e.coluna === coluna);

                if (expandAtual) {
                    if (expandAtual.tipo === "coluna") {
                        td.setAttribute("colspan", expandAtual.tamanho);
                    }
                    
                    if (expandAtual.tipo === "linha") {
                        td.setAttribute("rowspan", expandAtual.tamanho);
                    }
                }

                tr.appendChild(td);
            }
        }
        
        // Só adiciona a linha se ela tiver pelo menos uma célula
        if (tr.children.length > 0) {
            novaTabela.appendChild(tr);
        }
    }
    
    tabelaAtual.appendChild(novaTabela);
}