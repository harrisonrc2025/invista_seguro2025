// Calculadora de Investimentos - By Harrison Costa
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

// Função para calcular e exibir resultados
function calcularInvestimento() {
    const valorInicial = parseFloat(document.getElementById('valorInicial').value) || 3000;
    const aporteMensal = parseFloat(document.getElementById('aporteMensal').value) || 0;
    const anos = parseInt(document.getElementById('anos').value) || 10;
    const tipoInvestimento = document.getElementById('tipoInvestimento').value;
    
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
        const perfilRisco = document.getElementById('perfilRisco').value;
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
    
    // Verificar impenhorabilidade
    const statusPenhora = verificarImpenhorabilidade(tipoInvestimento, montanteFinal);
    
    // Calcular risco de penhora
    const risco = riscoPenhora[tipoInvestimento] || 0.8;
    
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
                <span>Tempo de Investimento:</span>
                <strong>${anos} anos</strong>
            </div>
            <div class="resultado-item">
                <span>Taxa de Juros Anual:</span>
                <strong>${(taxa * 100).toFixed(2)}%</strong>
            </div>
            <div class="resultado-item">
                <span>Montante Final:</span>
                <strong>R$ ${montanteFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Rendimento Total:</span>
                <strong>R$ ${rendimento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Imposto de Renda:</span>
                <strong>R$ ${ir.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Rendimento Líquido:</span>
                <strong>R$ ${(rendimento - ir).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
            <div class="resultado-item">
                <span>Valor Final Líquido:</span>
                <strong>R$ ${(montanteFinal - ir).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong>
            </div>
        </div>
        
        <h3>Análise de Penhorabilidade</h3>
        <div class="penhora-card">
            <div class="penhora-item">
                <span>Status de Impenhorabilidade:</span>
                <strong>${statusPenhora.impenhoravel}</strong>
            </div>
            <div class="penhora-item">
                <span>Motivo:</span>
                <strong>${statusPenhora.motivo}</strong>
            </div>
            <div class="penhora-item">
                <span>Limite de Proteção:</span>
                <strong>${statusPenhora.limite}</strong>
            </div>
            <div class="penhora-item">
                <span>Risco de Penhora:</span>
                <div class="risco-barra">
                    <div class="risco-nivel" style="width: ${risco * 100}%"></div>
                </div>
                <strong>${(risco * 100).toFixed(0)}%</strong>
            </div>
        </div>
    `;
    
    // Mostrar gráfico de evolução
    gerarGraficoEvolucao(valorInicial, aporteMensal, taxa, anos);
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
    
    // Aqui seria implementada a geração do gráfico usando uma biblioteca como Chart.js
    // Como estamos criando apenas o JavaScript base, deixaremos a implementação visual para o HTML/CSS
    
    const dadosGrafico = {
        labels: labels,
        patrimonio: dataPatrimonio,
        aportes: dataAportes,
        rendimentos: dataRendimentos
    };
    
    // Armazenar dados para uso posterior na renderização do gráfico
    window.dadosGrafico = dadosGrafico;
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

// Inicializar a calculadora quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Configurar listeners de eventos
    document.getElementById('tipoInvestimento').addEventListener('change', atualizarCampos);
    document.getElementById('calcularBtn').addEventListener('click', calcularInvestimento);
    
    // Inicializar campos
    atualizarCampos();
    
    // Calcular com valores padrão
    calcularInvestimento();
});
