let idEdicao = null; // Guarda o ID do item que está a ser editado
const SUPABASE_URL = 'https://pszgonbaqlhtzlcxspvd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzemdvbmJhcWxodHpsY3hzcHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMDgzODcsImV4cCI6MjA4NDU4NDM4N30.7dlyd31-6y4_HyaLVFCajjqBQQFOQI47_o26buPWFaI'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('equipamento-form');
const tabelaCorpo = document.getElementById('tabela-corpo');

// Inicia verificando se já existe alguém logado
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    configurarInterface(session);
    carregarDados();
});

// FUNÇÕES DE AUTENTICAÇÃO
async function fazerLogin() {
    const email = prompt("E-mail do Administrador:");
    const password = prompt("Senha:");
    
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert("Acesso negado: " + error.message);
    else location.reload();
}

async function fazerLogout() {
    await _supabase.auth.signOut();
    location.reload();
}

function configurarInterface(session) {
    const btnLogin = document.getElementById('btn-login');
    const userInfo = document.getElementById('user-info');
    const cadastroSection = document.getElementById('cadastro');

    if (session) {
        btnLogin.style.display = 'none';
        userInfo.style.display = 'block';
        cadastroSection.style.display = 'block';
        document.getElementById('user-email').innerText = session.user.email;
    }
}

// FUNÇÕES DO BANCO DE DADOS
async function carregarDados() {
    const { data, error } = await _supabase.from('equipamentos').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else {
        tabelaCorpo.innerHTML = '';
        data.forEach(item => adicionarLinhaTabela(item));
    }
}

// MODIFICADO: Evento de Submit (serve para Criar e para Editar)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        serie: document.getElementById('serie').value,
        status: document.getElementById('status').value
    };

    if (idEdicao) {
        // MODO EDIÇÃO: Atualiza o item existente
        const { error } = await _supabase
            .from('equipamentos')
            .update(dados)
            .eq('id', idEdicao);

        if (error) alert("Erro ao atualizar: " + error.message);
        else {
            alert("Equipamento atualizado!");
            idEdicao = null;
            const btn = form.querySelector('button');
            btn.innerText = "Adicionar"; 
            btn.style.backgroundColor = ""; // Volta para a cor original do CSS
            btn.style.color = "";
        }
    } 
    else {
        // MODO CRIAÇÃO: Insere um novo item
        const { error } = await _supabase
            .from('equipamentos')
            .insert([dados]);

        if (error) alert("Erro ao salvar: " + error.message);
    }

    carregarDados();
    form.reset();
});

// NOVA FUNÇÃO: Prepara o formulário para edição
async function prepararEdicao(id, nome, serie, status) {
    document.getElementById('nome').value = nome;
    document.getElementById('serie').value = serie;
    document.getElementById('status').value = status;

    idEdicao = id; 
    const btn = form.querySelector('button');
    btn.innerText = "Salvar Alterações";
    btn.style.backgroundColor = "#ffc107"; // Cor amarela para indicar edição
    btn.style.color = "black";
    form.scrollIntoView({ behavior: 'smooth' }); 
}

function adicionarLinhaTabela(item) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.serie}</td>
        <td><span class="status-tag ${item.status}">${item.status}</span></td>
        <td>
            <button onclick="prepararEdicao(${item.id}, '${item.nome}', '${item.serie}', '${item.status}')" style="background-color: #ffc107; color: black; border: none; padding: 5px; cursor: pointer; border-radius: 4px;">Editar</button>
            <button onclick="removerItem(${item.id})" class="btn-del">Excluir</button>
        </td>
    `;
    tabelaCorpo.appendChild(tr);
}

async function removerItem(id) {
    if (confirm("Deseja excluir este item?")) {
        const { error } = await _supabase.from('equipamentos').delete().eq('id', id);
        if (error) alert("Erro: Apenas administradores logados podem excluir.");
        else carregarDados();
    }
}