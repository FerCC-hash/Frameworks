let todasTabelas = document.getElementsByTagName("tabela");

for (let tabela of todasTabelas) {
    
    let qtdLinhas = parseInt(tabela.getAttribute("linha"));
    let qtdColunas = parseInt(tabela.getAttribute("coluna"));
    
    if (!qtdLinhas || !qtdColunas) {
        console.log("Erro: Defina uma linha e uma coluna");
        continue;
    }
    
    let tabelaHTML = document.createElement("table");
    
    let tagsExpand = tabela.getElementsByTagName("expand");
    let listaExpansoes = [];
    
    for (let expand of tagsExpand) {
        let linhaExp = parseInt(expand.getAttribute("linha"));
        let colunaExp = parseInt(expand.getAttribute("coluna"));
        let tamanhoExp = parseInt(expand.getAttribute("tamanho"));
        let tipoExp = expand.getAttribute("tipo");
        
        if (tipoExp === "coluna" && colunaExp + tamanhoExp > qtdColunas) {
            console.log("Erro: A coluna ja foi até o limite");
            continue;
        }
        
        if (tipoExp === "linha" && linhaExp + tamanhoExp > qtdLinhas) {
            console.log("Erro: A linha ja foi até o limite");
            continue;
        }
        
        listaExpansoes.push([linhaExp, colunaExp, tamanhoExp, tipoExp]);
    }
    
    let tagDados = tabela.getElementsByTagName("dados")[0];
    let listaDados = [];
    
    if (tagDados) {
        let textoDados = tagDados.textContent.trim();
        let linhasTexto = textoDados.split("\n");
        
        for (let linha of linhasTexto) {
            let celulas = linha.split("|");
            let celulasLimpa = [];
            
            for (let celula of celulas) {
                celulasLimpa.push(celula.trim());
            }
            
            listaDados.push(celulasLimpa);
        }
    }
    
    let dadosPlanos = [];
    for (let linha of listaDados) {
        for (let celula of linha) {
            dadosPlanos.push(celula);
        }
    }
    
    if (dadosPlanos.length > qtdLinhas * qtdColunas) {
        console.log("Erro:Espaços insufisientes na tabela, coloque mais espassos para colocar mais dados");
        continue;
    }
    
    let bordaConfig = tabela.getAttribute("borda");
    if (bordaConfig) {
        let partes = bordaConfig.split(" ");
        tabelaHTML.style.border = `${partes[0]} ${partes[1]} ${partes[2]}`;
    }
    
    let celulasReservadas = [];
    let indiceDadoAtual = 0;
    
    for (let linhaAtual = 0; linhaAtual < qtdLinhas; linhaAtual++) {
        let linhaHTML = document.createElement("tr");
        
        for (let colunaAtual = 0; colunaAtual < qtdColunas; colunaAtual++) {
            
            let estaReservada = false;
            for (let reserva of celulasReservadas) {
                if (reserva[0] === linhaAtual && reserva[1] === colunaAtual) {
                    estaReservada = true;
                    break;
                }
            }
            
            if (estaReservada) continue;
            
            let celulaHTML = document.createElement("td");
            let tamanhoExpansao = 1;
            let tipoExpansao = null;
            
            for (let exp of listaExpansoes) {
                if (exp[0] === linhaAtual && exp[1] === colunaAtual) {
                    tamanhoExpansao = exp[2];
                    tipoExpansao = exp[3];
                    break;
                }
            }
            
            if (tamanhoExpansao > 1 && tipoExpansao === "coluna") {
                celulaHTML.setAttribute("colspan", tamanhoExpansao);
                colunaAtual += tamanhoExpansao - 1;
            }
            
            else if (tamanhoExpansao > 1 && tipoExpansao === "linha") {
                celulaHTML.setAttribute("rowspan", tamanhoExpansao);
                
                for (let i = 1; i < tamanhoExpansao; i++) {
                    celulasReservadas.push([linhaAtual + i, colunaAtual]);
                }
            }
            
            if (indiceDadoAtual < dadosPlanos.length) {
                celulaHTML.textContent = dadosPlanos[indiceDadoAtual];
                indiceDadoAtual++;
            }
            
            linhaHTML.appendChild(celulaHTML);
        }
        
        tabelaHTML.appendChild(linhaHTML);
    }
    
    tabela.appendChild(tabelaHTML);
}