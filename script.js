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

// EVENTO SUBMIT
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        usuario: document.getElementById('usuario').value,
        setor: document.getElementById('setor').value, // Novo campo
        turno: document.getElementById('turno').value
    };

    if (idEdicao) {
        const { error, status } = await _supabase
            .from('equipamentos')
            .update(dados)
            .eq('id', idEdicao);

        if (error || status === 403) {
            alert("Acesso Negado: Somente administradores logados podem editar.");
        } else {
            alert("Colaborador atualizado com sucesso!");
            idEdicao = null;
            form.querySelector('button').innerText = "Adicionar";
        }
    } else {
        const { error } = await _supabase.from('equipamentos').insert([dados]);
        if (error) alert("Erro ao salvar: Verifique se as colunas no Supabase foram renomeadas.");
    }
    carregarDados();
    form.reset();
});

// FUNÇÃO PREPARAR EDIÇÃO (Atualizada com Setor)
async function prepararEdicao(id, nome, usuario, setor, turno) {
    document.getElementById('nome').value = nome;
    document.getElementById('usuario').value = usuario;
    document.getElementById('setor').value = setor;
    document.getElementById('turno').value = turno;

    idEdicao = id; 
    form.querySelector('button').innerText = "Salvar Alterações";
    form.scrollIntoView({ behavior: 'smooth' }); 
}

// FUNÇÃO ADICIONAR LINHA (Para mostrar o Setor na tabela)
function adicionarLinhaTabela(item) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.usuario}</td>
        <td>${item.setor}</td> <td>${item.turno}</td>
        <td>
            <button onclick="prepararEdicao(${item.id}, '${item.nome}', '${item.usuario}', '${item.setor}', '${item.turno}')" style="background-color: #ffc107; color: black; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; margin-right: 5px;">Editar</button>
            <button onclick="removerItem(${item.id})" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Excluir</button>
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

/// Substitui por esse arquivo, gemini me ajudo.
const inputBusca = document.getElementById('inputBusca');

if (inputBusca) {
    inputBusca.addEventListener('keyup', function() {
        const termo = inputBusca.value.toLowerCase();
        const linhas = tabelaCorpo.getElementsByTagName('tr');

        Array.from(linhas).forEach(linha => {
            // Verifica se a linha tem células antes de acessar
            if (linha.cells.length > 0) {
                const nome = linha.cells[0].textContent.toLowerCase();
                const serie = linha.cells[1].textContent.toLowerCase();

                if (nome.includes(termo) || serie.includes(termo)) {
                    linha.style.display = "";
                } else {
                    linha.style.display = "none";
                }
            }
        });
    });
}