// Configurações do Supabase (Substitua pelos seus dados do painel do Supabase)
const SUPABASE_URL = 'https://pszgonbaqlhtzlcxspvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzemdvbmJhcWxodHpsY3hzcHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDgzODcsImV4cCI6MjA4NDU4NDM4N30.7dlyd31-6y4_HyaLVFCajjqBQQFOQI47_o26buPWFaI';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('equipamento-form');
const tabelaCorpo = document.getElementById('tabela-corpo');

// Função para buscar dados do Banco Real
async function carregarDados() {
    const { data, error } = await supabase
        .from('equipamentos')
        .select('*');

    if (error) console.error('Erro ao buscar:', error);
    else {
        tabelaCorpo.innerHTML = ''; // Limpa a tabela antes de carregar
        data.forEach(item => adicionarLinhaTabela(item));
    }
}

// Função para salvar no Banco Real
form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const novoEquipamento = {
        nome: document.getElementById('nome').value,
        serie: document.getElementById('serie').value,
        status: document.getElementById('status').value
    };

    const { error } = await supabase
        .from('equipamentos')
        .insert([novoEquipamento]);

    if (error) alert('Erro ao salvar!');
    else {
        carregarDados();
        form.reset();
    }
});

// Escutando o evento de envio do formulário
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede a página de recarregar

    // Pegando os valores dos campos
    const nome = document.getElementById('nome').value;
    const serie = document.getElementById('serie').value;
    const status = document.getElementById('status').value;

    // Criando uma nova linha na tabela
    adicionarLinhaTabela(nome, serie, status);

    // Limpando o formulário
    form.reset();
});

function adicionarLinhaTabela(nome, serie, status) {
    const novaLinha = document.createElement('tr');

    novaLinha.innerHTML = `
        <td>${nome}</td>
        <td>${serie}</td>
        <td><span class="status-tag ${status}">${status}</span></td>
        <td><button onclick="removerLinha(this)">Excluir</button></td>
    `;

    tabelaCorpo.appendChild(novaLinha);
}

function removerLinha(botao) {
    // Remove a linha (tr) que contém o botão clicado
    botao.parentElement.parentElement.remove();
}