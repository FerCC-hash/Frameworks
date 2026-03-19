// Versão com validações
let tabelas = document.getElementsByTagName("tabela");

for (let i = 0; i < tabelas.length; i++) {
    let tabelaAtual = tabelas[i];
    let erro = false;
    let mensagemErro = "";
    
    // ===== VALIDAÇÃO 1: Verificar se linhas e colunas foram informadas =====
    let linhasAttr = tabelaAtual.getAttribute("linha");
    let colunasAttr = tabelaAtual.getAttribute("coluna");
    
    if (!linhasAttr || !colunasAttr) {
        erro = true;
        mensagemErro = "ERRO: As quantidades de linhas e colunas devem ser informadas!";
    } else {
        let linhas = parseInt(linhasAttr);
        let colunas = parseInt(colunasAttr);
        
        // ===== VALIDAÇÃO 2: Verificar quantidade de dados =====
        let dados = tabelaAtual.getElementsByTagName("dados");
        let totalCelulas = linhas * colunas;
        
        if (dados.length > totalCelulas) {
            erro = true;
            mensagemErro = "ERRO: Quantidade de dados (" + dados.length + 
                          ") é maior que a quantidade de células da tabela (" + 
                          totalCelulas + ")!";
        }
        
        // ===== VALIDAÇÃO 3: Verificar compatibilidade dos expands =====
        if (!erro) {
            let expands = tabelaAtual.getElementsByTagName("expand");
            let expandsInfo = [];
            
            // Coleta informações dos expands e já valida cada um
            for (let e = 0; e < expands.length; e++) {
                let linhaExpand = parseInt(expands[e].getAttribute("linha"));
                let colunaExpand = parseInt(expands[e].getAttribute("coluna"));
                let tamanho = parseInt(expands[e].getAttribute("tamanho"));
                let tipo = expands[e].getAttribute("tipo");
                
                // Valida se a posição do expand está dentro dos limites
                if (linhaExpand >= linhas || colunaExpand >= colunas) {
                    erro = true;
                    mensagemErro = "ERRO: Expand na posição (linha " + linhaExpand + 
                                  ", coluna " + colunaExpand + 
                                  ") está fora dos limites da tabela " + linhas + "x" + colunas + "!";
                    break;
                }
                
                // Valida compatibilidade do tamanho com os limites da tabela
                if (tipo === "coluna") { // colspan
                    if (colunaExpand + tamanho > colunas) {
                        erro = true;
                        mensagemErro = "ERRO: Colspan de tamanho " + tamanho + 
                                      " na coluna " + colunaExpand + 
                                      " ultrapassa o limite de " + colunas + " colunas!";
                        break;
                    }
                } else if (tipo === "linha") { // rowspan
                    if (linhaExpand + tamanho > linhas) {
                        erro = true;
                        mensagemErro = "ERRO: Rowspan de tamanho " + tamanho + 
                                      " na linha " + linhaExpand + 
                                      " ultrapassa o limite de " + linhas + " linhas!";
                        break;
                    }
                } else {
                    erro = true;
                    mensagemErro = "ERRO: Tipo de expand inválido! Use 'linha' ou 'coluna'.";
                    break;
                }
                
                // Se passou nas validações, adiciona ao array
                expandsInfo.push({
                    linha: linhaExpand,
                    coluna: colunaExpand,
                    tamanho: tamanho,
                    tipo: tipo
                });
            }
            
            // ===== Se não houve erro, CRIA A TABELA =====
            if (!erro) {
                let novaTabela = document.createElement("table");
                
                // Aplica as bordas se existirem
                let bordaAttr = tabelaAtual.getAttribute("borda");
                if (bordaAttr) {
                    let vetBorda = bordaAttr.split(" ");
                    novaTabela.style.setProperty('--tamanho-borda', vetBorda[0]);
                    novaTabela.style.setProperty('--tipo-borda', vetBorda[1]);
                    novaTabela.style.setProperty('--cor-borda', vetBorda[2]);
                }
                
                // Cria matriz "ocupado" com dimensões linhas x colunas
                let ocupado = Array(linhas).fill().map(() => Array(colunas).fill(false));
                
                // Marca as células que serão ocupadas por rowspan ou colspan
                for (let exp of expandsInfo) {
                    if (exp.tipo === "linha") { // rowspan
                        for (let l = 1; l < exp.tamanho; l++) {
                            if (exp.linha + l < linhas) {
                                ocupado[exp.linha + l][exp.coluna] = true;
                            }
                        }
                    } else if (exp.tipo === "coluna") { // colspan
                        for (let c = 1; c < exp.tamanho; c++) {
                            if (exp.coluna + c < colunas) {
                                ocupado[exp.linha][exp.coluna + c] = true;
                            }
                        }
                    }
                }
                
                // Constrói a tabela percorrendo cada célula
                let indiceDado = 0; // Controla qual dado será inserido
                
                for (let linha = 0; linha < linhas; linha++) {
                    let tr = document.createElement("tr");
                    
                    for (let coluna = 0; coluna < colunas; coluna++) {
                        // Se a célula não estiver ocupada por uma expansão anterior
                        if (!ocupado[linha][coluna]) {
                            let td = document.createElement("td");
                            
                            // Insere dados se existirem (usando o índice controlado)
                            if (indiceDado < dados.length) {
                                td.textContent = dados[indiceDado].textContent;
                                indiceDado++;
                            }
                            
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
        }
    }
    
    // ===== Exibe mensagem de erro se houver =====
    if (erro) {
        let divErro = document.createElement("div");
        divErro.style.color = "red";
        divErro.style.fontWeight = "bold";
        divErro.style.margin = "10px";
        divErro.style.padding = "10px";
        divErro.style.border = "1px solid red";
        divErro.textContent = mensagemErro;
        tabelaAtual.appendChild(divErro);
    }
}