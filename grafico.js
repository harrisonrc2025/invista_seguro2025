// Código para gerar gráficos de evolução do patrimônio
// Complemento para calculadora.js

document.addEventListener('DOMContentLoaded', function() {
    // Configurar o gráfico quando a página carregar
    setupChart();
    
    // Adicionar listener para atualizar o gráfico quando o botão calcular for clicado
    document.getElementById('calcularBtn').addEventListener('click', function() {
        updateChart();
    });
});

// Função para configurar o gráfico inicial
function setupChart() {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');
    
    // Criar gráfico vazio inicialmente
    window.evolucaoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Patrimônio Total',
                    data: [],
                    backgroundColor: 'rgba(0, 120, 215, 0.2)',
                    borderColor: 'rgba(0, 120, 215, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Total Investido',
                    data: [],
                    backgroundColor: 'rgba(232, 62, 140, 0.1)',
                    borderColor: 'rgba(232, 62, 140, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Rendimentos',
                    data: [],
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL' 
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Período'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL',
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                }
            }
        }
    });
    
    // Calcular com valores padrão para mostrar um gráfico inicial
    calcularInvestimento();
}

// Função para atualizar o gráfico com novos dados
function updateChart() {
    // Verificar se os dados do gráfico estão disponíveis
    if (!window.dadosGrafico) return;
    
    const { labels, patrimonio, aportes, rendimentos } = window.dadosGrafico;
    
    // Atualizar dados do gráfico
    window.evolucaoChart.data.labels = labels;
    window.evolucaoChart.data.datasets[0].data = patrimonio;
    window.evolucaoChart.data.datasets[1].data = aportes;
    window.evolucaoChart.data.datasets[2].data = rendimentos;
    
    // Atualizar o gráfico
    window.evolucaoChart.update();
}

// Função para atualizar índices de mercado em tempo real
function atualizarIndices() {
    // Simulação de atualização de índices
    // Em um ambiente real, isso seria feito com uma API de dados financeiros
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-BR');
    const horaFormatada = dataAtual.toLocaleTimeString('pt-BR');
    
    // Atualizar taxas com pequenas variações aleatórias para simular mudanças de mercado
    taxas.tesouro_selic = (0.1325 + (Math.random() * 0.002 - 0.001)).toFixed(4) * 1;
    taxas.tesouro_prefixado = (0.1250 + (Math.random() * 0.002 - 0.001)).toFixed(4) * 1;
    taxas.tesouro_ipca = (0.0650 + (Math.random() * 0.002 - 0.001)).toFixed(4) * 1;
    taxas.ipca_anual = (0.0450 + (Math.random() * 0.001 - 0.0005)).toFixed(4) * 1;
    taxas.cdb_medio = (0.1250 + (Math.random() * 0.002 - 0.001)).toFixed(4) * 1;
    
    // Exibir informação de atualização
    const infoDiv = document.createElement('div');
    infoDiv.className = 'atualizacao-info';
    infoDiv.innerHTML = `<p>Índices atualizados em: ${dataFormatada} às ${horaFormatada}</p>`;
    
    // Adicionar ao DOM se o elemento não existir
    if (!document.querySelector('.atualizacao-info')) {
        const calculadoraForm = document.querySelector('.calculator-form');
        calculadoraForm.appendChild(infoDiv);
    } else {
        document.querySelector('.atualizacao-info').innerHTML = infoDiv.innerHTML;
    }
    
    // Recalcular com os novos valores
    calcularInvestimento();
}

// Configurar atualização periódica dos índices (a cada 5 minutos)
setInterval(atualizarIndices, 300000);

// Chamar uma vez para inicializar
setTimeout(atualizarIndices, 2000);
