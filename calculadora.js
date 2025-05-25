// Calculadora de Investimentos Aprimorada - By Harrison Costa
// Desenvolvido para análise de investimentos penhoráveis e impenhoráveis

// Taxas de juros atualizadas (valores de referência para 2025)
const taxas = {
    tesouro_selic: 0.1325, // 13,25% ao ano
    tesouro_prefixado: 0.1250, // 12,50% ao ano
    tesouro_ipca: 0.0650, // 6,50% ao ano + IPCA
    ipca_anual: 0.0450, // 4,50% ao ano (estimativa)
    cdb_medio: 0.1250, // 12,50% ao ano (média de 95% do CDI)
    lci_lca: 0.1150, // 11,50% ao ano (média de 90% do CDI)
    previdencia_conservadora: 0.1050, // 10,50% ao ano
    previdencia_moderada: 0.1150, // 11,50% ao ano
    previdencia_agressiva: 0.1250, // 12,50% ao ano
    poupanca: 0.0750, // 7,50% ao ano
    fundos_di: 0.1150, // 11,50% ao ano
    fundos_renda_fixa: 0.1200, // 12,00% ao ano
    fundos_multimercado: 0.1350, // 13,50% ao ano
    acoes: 0.1500, // 15,00% ao ano (estimativa)
    fiis: 0.1200, // 12,00% ao ano (estimativa)
};

// Expectativa de vida para cálculo de valor vitalício (em anos)
const expectativaVida = {
    30: 50, // 30 anos de idade: mais 50 anos de expectativa
    40: 42, // 40 anos de idade: mais 42 anos de expectativa
    50: 33, // 50 anos de idade: mais 33 anos de expectativa
    60: 23, // 60 anos de idade: mais 23 anos de expectativa
    70: 15, // 70 anos de idade: mais 15 anos de expectativa
    80: 9,  // 80 anos de idade: mais 9 anos de expectativa
    padrao: 25 // valor padrão para cálculo
};

// Riscos de penhora (0 = baixo risco, 1 = alto risco)
const riscoPenhora = {
    tesouro_selic: 0.7,
    tesouro_prefixado: 0.7,
    tesouro_ipca: 0.7,
    cdb: 0.7,
    lci_lca: 0.7,
    previdencia_pgbl: 0.3,
    previdencia_vgbl: 0.3,
    poupanca: 0.5, // Até 40 salários mínimos é impenhorável
    fundos_di: 0.8,
    fundos_renda_fixa: 0.8,
    fundos_multimercado: 0.9,
    acoes: 1.0,
    fiis: 1.0,
};

// Motivos de impenhorabilidade
const motivosImpenhorabilidade = {
    previdencia: "Jurisprudência do STJ reconhece natureza alimentar e previdenciária, avaliada caso a caso.",
    poupanca: "Art. 833, X do CPC - Impenhorável até 40 salários mínimos.",
    renda_fixa: "Jurisprudência recente do STJ estende proteção para aplicações financeiras até 40 salários mínimos, se destinadas ao sustento.",
    renda_variavel: "Totalmente penhorável, sem proteção jurídica específica."
};

// Função para calcular rendimento futuro
function calcularRendimento(valorInicial, taxa, anos) {
    return valorInicial * Math.pow(1 + taxa, anos);
}

// Função para calcular rendimento com aportes mensais
function calcularRendimentoComAportes(valorInicial, aporteMensal, taxa, anos) {
    let montante = valorInicial;
    const taxaMensal = Math.pow(1 + taxa, 1/12) - 1;
    
    for (let i = 0; i < anos * 12; i++) {
        montante = montante * (1 + taxaMensal) + aporteMensal;
    }
    
    return montante;
}

// Função para calcular IR sobre rendimentos (tabela regressiva)
function calcularIR(rendimento, anos) {
    let aliquota;
    
    if (anos <= 2) {
        aliquota = 0.175; // 17,5% até 2 anos
    } else if (anos <= 4) {
        aliquota = 0.15; // 15% de 2 a 4 anos
    } else if (anos <= 6) {
        aliquota = 0.125; // 12,5% de 4 a 6 anos
    } else {
        aliquota = 0.10; // 10% acima de 6 anos
    }
    
    return rendimento * aliquota;
}

// Função para calcular valor vitalício (renda mensal estimada)
function calcularValorVitalicio(montanteFinal, idade) {
    // Determinar expectativa de vida restante
    let anosRestantes;
    if (idade >= 80) {
        anosRestantes = expectativaVida[80];
    } else if (idade >= 70) {
        anosRestantes = expectativaVida[70];
    } else if (idade >= 60) {
        anosRestantes = expectativaVida[60];
    } else if (idade >= 50) {
        anosRestantes = expectativaVida[50];
    } else if (idade >= 40) {
        anosRestantes = expectativaVida[40];
    } else if (idade >= 30) {
        anosRestantes = expectativaVida[30];
    } else {
        anosRestantes = expectativaVida.padrao;
    }
    
    // Taxa de juros mensal conservadora para a fase de desacumulação (4% a.a.)
    const taxaMensalDesacumulacao = Math.pow(1.04, 1/12) - 1;
    
    // Fator de valor presente de uma anuidade
    // Fórmula: [1 - (1 + r)^-n] / r, onde r é a taxa mensal e n é o número de meses
    const meses = anosRestantes * 12;
    const fatorAnuidade = (1 - Math.pow(1 + taxaMensalDesacumulacao, -meses)) / taxaMensalDesacumulacao;
    
    // Valor da renda mensal vitalícia estimada
    return montanteFinal / fatorAnuidade;
}

// Função para verificar impenhorabilidade
function verificarImpenhorabilidade(tipoInvestimento, valor) {
    const salarioMinimo = 1412; // Valor do salário mínimo em 2025
    const limite40SM = salarioMinimo * 40;
    
    if (tipoInvestimento.includes('previdencia')) {
        return {
            impenhoravel: "Parcialmente",
            motivo: motivosImpenhorabilidade.previdencia,
            limite: "Avaliado caso a caso pelo juiz"
        };
    } else if (tipoInvestimento === 'poupanca') {
        return {
            impenhoravel: valor <= limite40SM ? "Sim" : "Parcialmente",
            motivo: motivosImpenhorabilidade.poupanca,
            limite: `R$ ${limite40SM.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        };
    } else if (['tesouro_selic', 'tesouro_prefixado', 'tesouro_ipca', 'cdb', 'lci_lca', 'fundos_di', 'fundos_renda_fixa'].includes(tipoInvestimento)) {
        return {
            impenhoravel: valor <= limite40SM ? "Possivelmente" : "Não",
            motivo: motivosImpenhorabilidade.renda_fixa,
            limite: `R$ ${limite40SM.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`
        };
    } else {
        return {
            impenhoravel: "Não",
            motivo: motivosImpenhorabilidade.renda_variavel,
            limite: "Não aplicável"
        };
    }
}

// Função para calcular e exibir resultados para um período específico
function calcularParaPeriodo(valorInicial, aporteMensal, anos, tipoInvestimento, perfilRisco, idade) {
    let taxa;
    if (tipoInvestimento === 'tesouro_selic') {
        taxa = taxas.tesouro_selic;
    } else if (tipoInvestimento === 'tesouro_prefixado') {
        taxa = taxas.tesouro_prefixado;
    } else if (tipoInvestimento === 'tesouro_ipca') {
        taxa = taxas.tesouro_ipca + taxas.ipca_anual;
    } else if (tipoInvestimento === 'cdb') {
        taxa = taxas.cdb_medio;
    } else if (tipoInvestimento === 'lci_lca') {
        taxa = taxas.lci_lca;
    } else if (tipoInvestimento === 'previdencia_pgbl' || tipoInvestimento === 'previdencia_vgbl') {
        if (perfilRisco === 'conservador') {
            taxa = taxas.previdencia_conservadora;
        } else if (perfilRisco === 'moderado') {
            taxa = taxas.previdencia_moderada;
        } else {
            taxa = taxas.previdencia_agressiva;
        }
    } else if (tipoInvestimento === 'poupanca') {
        taxa = taxas.poupanca;
    } else if (tipoInvestimento === 'fundos_di') {
        taxa = taxas.fundos_di;
    } else if (tipoInvestimento === 'fundos_renda_fixa') {
        taxa = taxas.fundos_renda_fixa;
    } else if (tipoInvestimento === 'fundos_multimercado') {
        taxa = taxas.fundos_multimercado;
    } else if (tipoInvestimento === 'acoes') {
        taxa = taxas.acoes;
    } else if (tipoInvestimento === 'fiis') {
        taxa = taxas.fiis;
    }
    
    // Calcular montante final
    const montanteFinal = calcularRendimentoComAportes(valorInicial, aporteMensal, taxa, anos);
    const rendimento = montanteFinal - (valorInicial + (aporteMensal * anos * 12));
    
    // Calcular IR (exceto para LCI/LCA e dividendos de FIIs que são isentos)
    let ir = 0;
    if (!['lci_lca', 'fiis'].includes(tipoInvestimento)) {
        ir = calcularIR(rendimento, anos);
    }
    
    // Calcular valor líquido final
    const valorLiquidoFinal = montanteFinal - ir;
    
    // Calcular valor vitalício (renda mensal estimada)
    const valorVitalicio = calcularValorVitalicio(valorLiquidoFinal, idade);
    
    // Verificar impenhorabilidade
    const statusPenhora = verificarImpenhorabilidade(tipoInvestimento, montanteFinal);
    
    // Calcular risco de penhora
    const risco = riscoPenhora[tipoInvestimento] || 0.8;
    
    return {
        anos,
        taxa,
        montanteFinal,
        rendimento,
        ir,
        valorLiquidoFinal,
        valorVitalicio,
        statusPenhora,
        risco
    };
}

// Função para calcular rendas vitalícias para todos os investimentos
function calcularRendasVitaliciasComparativas(valorInicial, aporteMensal, anos, idade) {
    const resultados = {};
    
    // Tesouro Direto
    resultados.tesouro_selic = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'tesouro_selic', null, idade).valorVitalicio;
    resultados.tesouro_prefixado = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'tesouro_prefixado', null, idade).valorVitalicio;
    resultados.tesouro_ipca = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'tesouro_ipca', null, idade).valorVitalicio;
    
    // Renda Fixa
    resultados.cdb = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'cdb', null, idade).valorVitalicio;
    resultados.lci_lca = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'lci_lca', null, idade).valorVitalicio;
    resultados.poupanca = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'poupanca', null, idade).valorVitalicio;
    resultados.fundos_di = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'fundos_di', null, idade).valorVitalicio;
    resultados.fundos_renda_fixa = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'fundos_renda_fixa', null, idade).valorVitalicio;
    
    // Previdência
    resultados.previdencia_conservadora = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'previdencia_pgbl', 'conservador', idade).valorVitalicio;
    resultados.previdencia_moderada = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'previdencia_pgbl', 'moderado', idade).valorVitalicio;
    resultados.previdencia_agressiva = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'previdencia_pgbl', 'agressivo', idade).valorVitalicio;
    
    // Renda Variável
    resultados.fundos_multimercado = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'fundos_multimercado', null, idade).valorVitalicio;
    resultados.acoes = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'acoes', null, idade).valorVitalicio;
    resultados.fiis = calcularParaPeriodo(valorInicial, aporteMensal, anos, 'fiis', null, idade).valorVitalicio;
    
    return resultados;
}

// Função para calcular e exibir resultados para todos os períodos padrão
function calcularInvestimento() {
    const valorInicial = parseFloat(document.getElementById('valorInicial').value) || 3000;
    const aporteMensal = parseFloat(document.getElementById('aporteMensal').value) || 0;
    const tipoInvestimento = document.getElementById('tipoInvestimento').value;
    const idade = parseInt(document.getElementById('idade').value) || 40;
    
    let perfilRisco = 'moderado';
    if (document.getElementById('perfilRiscoDiv').style.display !== 'none') {
        perfilRisco = document.getElementById('perfilRisco').value;
    }
    
    // Calcular para períodos padrão (5, 10 e 20 anos)
    const resultado5Anos = calcularParaPeriodo(valorInicial, aporteMensal, 5, tipoInvestimento, perfilRisco, idade);
    const resultado10Anos = calcularParaPeriodo(valorInicial, aporteMensal, 10, tipoInvestimento, perfilRisco, idade);
    const resultado20Anos = calcularParaPeriodo(valorInicial, aporteMensal, 20, tipoInvestimento, perfilRisco, idade);
    
    // Calcular para período personalizado
    const anosPers = parseInt(document.getElementById('anos').value) || 10;
    let resultadoPers = resultado10Anos; // Valor padrão
    
    // Se o período personalizado for diferente dos padrões, calcular novamente
    if (anosPers !== 5 && anosPers !== 10 && anosPers !== 20) {
        resultadoPers = calcularParaPeriodo(valorInicial, aporteMensal, anosPers, tipoInvestimento, perfilRisco, idade);
    } else if (anosPers === 5) {
        resultadoPers = resultado5Anos;
    } else if (anosPers === 10) {
        resultadoPers = resultado10Anos;
    } else if (anosPers === 20) {
        resultadoPers = resultado20Anos;
    }
    
    // Calcular rendas vitalícias para todos os investimentos
    const rendasVitaliciasComparativas = {
        anos5: calcularRendasVitaliciasComparativas(valorInicial, aporteMensal, 5, idade),
        anos10: calcularRendasVitaliciasComparativas(valorInicial, aporteMensal, 10, idade),
        anos20: calcularRendasVitaliciasComparativas(valorInicial, aporteMensal, 20, idade)
    };
    
    // Exibir resultados
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = `
        <h3>Resultado da Simulação</h3>
        <div class="resultado-card">
            <div class="resultado-item">
                <span>Valor Inicial:</span>
                <strong>R$ ${valorInicial.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Aporte Mensal:</span>
                <strong>R$ ${aporteMensal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Idade Atual:</span>
                <strong>${idade} anos</strong>
            </div>
            <div class="resultado-item">
                <span>Taxa de Juros Anual:</span>
                <strong>${(resultadoPers.taxa * 100).toFixed(2)}%</strong>
            </div>
        </div>
        
        <h3>Comparativo por Período</h3>
        <div class="tabela-comparativa">
            <table>
                <thead>
                    <tr>
                        <th>Período</th>
                        <th>Montante Final</th>
                        <th>Rendimento</th>
                        <th>Valor Líquido</th>
                        <th>Renda Mensal Vitalícia</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>5 anos</strong></td>
                        <td>R$ ${resultado5Anos.montanteFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado5Anos.rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado5Anos.valorLiquidoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado5Anos.valorVitalicio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr>
                        <td><strong>10 anos</strong></td>
                        <td>R$ ${resultado10Anos.montanteFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado10Anos.rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado10Anos.valorLiquidoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado10Anos.valorVitalicio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr>
                        <td><strong>20 anos</strong></td>
                        <td>R$ ${resultado20Anos.montanteFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado20Anos.rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado20Anos.valorLiquidoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultado20Anos.valorVitalicio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    ${anosPers !== 5 && anosPers !== 10 && anosPers !== 20 ? `
                    <tr>
                        <td><strong>${anosPers} anos</strong></td>
                        <td>R$ ${resultadoPers.montanteFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultadoPers.rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultadoPers.valorLiquidoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td>R$ ${resultadoPers.valorVitalicio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
        
        <h3>Renda Vitalícia Comparativa (${resultadoPers.anos} anos)</h3>
        <div class="tabela-comparativa">
            <table>
                <thead>
                    <tr>
                        <th>Tipo de Investimento</th>
                        <th>Renda Mensal Vitalícia</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="${tipoInvestimento === 'tesouro_selic' ? 'destaque' : ''}">
                        <td><strong>Tesouro Selic</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].tesouro_selic.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'tesouro_prefixado' ? 'destaque' : ''}">
                        <td><strong>Tesouro Prefixado</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].tesouro_prefixado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'tesouro_ipca' ? 'destaque' : ''}">
                        <td><strong>Tesouro IPCA+</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].tesouro_ipca.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'cdb' ? 'destaque' : ''}">
                        <td><strong>CDB</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].cdb.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'lci_lca' ? 'destaque' : ''}">
                        <td><strong>LCI/LCA</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].lci_lca.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'poupanca' ? 'destaque' : ''}">
                        <td><strong>Poupança</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].poupanca.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${(tipoInvestimento === 'previdencia_pgbl' || tipoInvestimento === 'previdencia_vgbl') && perfilRisco === 'conservador' ? 'destaque' : ''}">
                        <td><strong>Previdência (Conservadora)</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].previdencia_conservadora.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${(tipoInvestimento === 'previdencia_pgbl' || tipoInvestimento === 'previdencia_vgbl') && perfilRisco === 'moderado' ? 'destaque' : ''}">
                        <td><strong>Previdência (Moderada)</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].previdencia_moderada.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${(tipoInvestimento === 'previdencia_pgbl' || tipoInvestimento === 'previdencia_vgbl') && perfilRisco === 'agressivo' ? 'destaque' : ''}">
                        <td><strong>Previdência (Agressiva)</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].previdencia_agressiva.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'fundos_multimercado' ? 'destaque' : ''}">
                        <td><strong>Fundos Multimercado</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].fundos_multimercado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'acoes' ? 'destaque' : ''}">
                        <td><strong>Ações</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].acoes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                    <tr class="${tipoInvestimento === 'fiis' ? 'destaque' : ''}">
                        <td><strong>Fundos Imobiliários</strong></td>
                        <td>R$ ${rendasVitaliciasComparativas[`anos${resultadoPers.anos === 5 ? '5' : (resultadoPers.anos === 10 ? '10' : '20')}`].fiis.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <h3>Detalhes do Período Selecionado (${resultadoPers.anos} anos)</h3>
        <div class="resultado-card">
            <div class="resultado-item">
                <span>Montante Final:</span>
                <strong>R$ ${resultadoPers.montanteFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Rendimento Total:</span>
                <strong>R$ ${resultadoPers.rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Imposto de Renda:</span>
                <strong>R$ ${resultadoPers.ir.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Rendimento Líquido:</span>
                <strong>R$ ${(resultadoPers.rendimento - resultadoPers.ir).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Valor Final Líquido:</span>
                <strong>R$ ${resultadoPers.valorLiquidoFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item highlight">
                <span>Renda Mensal Vitalícia Estimada:</span>
                <strong>R$ ${resultadoPers.valorVitalicio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}/mês</strong>
            </div>
        </div>
        
        <h3>Análise de Penhorabilidade</h3>
        <div class="penhora-card">
            <div class="penhora-item">
                <span>Status de Impenhorabilidade:</span>
                <strong>${resultadoPers.statusPenhora.impenhoravel}</strong>
            </div>
            <div class="penhora-item">
                <span>Motivo:</span>
                <strong>${resultadoPers.statusPenhora.motivo}</strong>
            </div>
            <div class="penhora-item">
                <span>Limite de Proteção:</span>
                <strong>${resultadoPers.statusPenhora.limite}</strong>
            </div>
            <div class="penhora-item">
                <span>Risco de Penhora:</span>
                <div class="risco-barra">
                    <div class="risco-nivel" style="width: ${resultadoPers.risco * 100}%"></div>
                </div>
                <strong>${(resultadoPers.risco * 100).toFixed(0)}%</strong>
            </div>
        </div>
    `;
    
    // Mostrar gráfico de evolução
    gerarGraficoEvolucao(valorInicial, aporteMensal, resultadoPers.taxa, resultadoPers.anos);
}

// Função para gerar gráfico de evolução do patrimônio
function gerarGraficoEvolucao(valorInicial, aporteMensal, taxa, anos) {
    const taxaMensal = Math.pow(1 + taxa, 1/12) - 1;
    const labels = [];
    const dataPatrimonio = [];
    const dataAportes = [];
    const dataRendimentos = [];
    
    let montante = valorInicial;
    let totalAportes = valorInicial;
    
    for (let i = 0; i <= anos * 12; i++) {
        if (i % 12 === 0) { // Mostrar apenas anos completos no gráfico
            labels.push(`Ano ${i/12}`);
            dataPatrimonio.push(montante);
            dataAportes.push(totalAportes);
            dataRendimentos.push(montante - totalAportes);
        }
        
        if (i < anos * 12) {
            montante = montante * (1 + taxaMensal) + aporteMensal;
            totalAportes += aporteMensal;
        }
    }
    
    // Armazenar dados para uso posterior na renderização do gráfico
    window.dadosGrafico = {
        labels: labels,
        patrimonio: dataPatrimonio,
        aportes: dataAportes,
        rendimentos: dataRendimentos
    };
}

// Função para atualizar campos com base no tipo de investimento selecionado
function atualizarCampos() {
    const tipoInvestimento = document.getElementById('tipoInvestimento').value;
    const perfilRiscoDiv = document.getElementById('perfilRiscoDiv');
    
    if (tipoInvestimento === 'previdencia_pgbl' || tipoInvestimento === 'previdencia_vgbl') {
        perfilRiscoDiv.style.display = 'block';
    } else {
        perfilRiscoDiv.style.display = 'none';
    }
}

// Função para selecionar período padrão
function selecionarPeriodo(anos) {
    document.getElementById('anos').value = anos;
    calcularInvestimento();
}

// Inicializar a calculadora quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Configurar listeners de eventos
    document.getElementById('tipoInvestimento').addEventListener('change', atualizarCampos);
    document.getElementById('calcularBtn').addEventListener('click', calcularInvestimento);
    
    // Configurar botões de período
    document.getElementById('btn5anos').addEventListener('click', function() {
        selecionarPeriodo(5);
    });
    
    document.getElementById('btn10anos').addEventListener('click', function() {
        selecionarPeriodo(10);
    });
    
    document.getElementById('btn20anos').addEventListener('click', function() {
        selecionarPeriodo(20);
    });
    
    // Inicializar campos
    atualizarCampos();
    
    // Calcular com valores padrão
    calcularInvestimento();
});
