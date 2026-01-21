
const SUPABASE_URL = 'https://pszgonbaqlhtzlcxspvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzemdvbmJhcWxodHpsY3hzcHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDgzODcsImV4cCI6MjA4NDU4NDM4N30.7dlyd31-6y4_HyaLVFCajjqBQQFOQI47_o26buPWFaI'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('equipamento-form');
const tabelaCorpo = document.getElementById('tabela-corpo');

// Carrega os dados do banco assim que a página abrir
document.addEventListener('DOMContentLoaded', carregarDados);

async function carregarDados() {
    const { data, error } = await _supabase.from('equipamentos').select('*');
    if (error) return console.error('Erro ao buscar:', error);
    
    tabelaCorpo.innerHTML = '';
    data.forEach(item => adicionarLinhaTabela(item));
}

form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const novoEquipamento = {
        nome: document.getElementById('nome').value,
        serie: document.getElementById('serie').value,
        status: document.getElementById('status').value
    };

    const { error } = await _supabase.from('equipamentos').insert([novoEquipamento]);

    if (error) alert('Erro ao salvar no banco!');
    else {
        carregarDados();
        form.reset();
    }
});

function adicionarLinhaTabela(item) {
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.serie}</td>
        <td>${item.status}</td>
        <td><button onclick="removerItem(${item.id})">Excluir</button></td>
    `;
    tabelaCorpo.appendChild(novaLinha);
}

async function removerItem(id) {
    const { error } = await _supabase.from('equipamentos').delete().eq('id', id);
    if (error) alert('Erro ao deletar!');
    else carregarDados();
}