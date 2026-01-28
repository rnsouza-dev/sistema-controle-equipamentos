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
    atualizarGrafico()
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

async function registrarLog(acao, colaboradorNome) {
    const { data: { session } } = await _supabase.auth.getSession();
    if (!session) return;

    const novoLog = {
        usuario_admin: session.user.email,
        acao: acao,
        colaborador_afetado: colaboradorNome
    };

    const { error } = await _supabase.from('logs').insert([novoLog]);
    if (error) console.error("Erro ao gravar log:", error);
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
    atualizarGrafico()


    const dados = {
        nome: document.getElementById('nome').value,
        usuario: document.getElementById('usuario').value,
        setor: document.getElementById('setor').value,
        turno: document.getElementById('turno').value
    };

    if (idEdicao) {
        // --- MODO EDIÇÃO ---
        const { error, status } = await _supabase
            .from('equipamentos')
            .update(dados)
            .eq('id', idEdicao);

        if (error || status === 403) {
            alert("Acesso Negado: Somente administradores podem editar.");
        } else {
            await registrarLog("EDIÇÃO", dados.nome); // Grava o Log de Edição
            alert("Colaborador atualizado com sucesso!");
            idEdicao = null;
            form.querySelector('button').innerText = "Adicionar";
        }
    } else {
        // --- MODO CRIAÇÃO ---
        const { error } = await _supabase.from('equipamentos').insert([dados]);
        
        if (error) {
            console.error(error);
            alert("Erro ao salvar: Verifique se as colunas no Supabase estão corretas.");
        } else {
            await registrarLog("CADASTRO", dados.nome); // Grava o Log de Cadastro
            alert("Colaborador cadastrado com sucesso!");
        }
    }

    carregarDados();
    form.reset();
});

// FUNÇÃO PREPARAR EDIÇÃO
async function prepararEdicao(id, nome, usuario, setor, turno) {
    document.getElementById('nome').value = nome;
    document.getElementById('usuario').value = usuario;
    document.getElementById('setor').value = setor;
    document.getElementById('turno').value = turno;

    idEdicao = id; 
    form.querySelector('button').innerText = "Salvar Alterações";
    form.scrollIntoView({ behavior: 'smooth' }); 
}

// FUNÇÃO ADICIONAR LINHA
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
        if (error) {
            alert("Erro: Apenas administradores logados podem excluir.");
        } else {
            await registrarLog("EXCLUSÃO", "ID: " + id);    
            await carregarDados();
            await atualizarGrafico();
        }
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
                const usuario = linha.cells[1].textContent.toLowerCase();

                if (nome.includes(termo) || usuario.includes(termo)) {
                    linha.style.display = "";
                } else {
                    linha.style.display = "none";
                }
            }
        });
    });
}

let meuGrafico = null; // Guarda a instância do gráfico para podermos atualizar

async function atualizarGrafico() {
    const { data, error } = await _supabase.from('equipamentos').select('turno');
    
    if (error) return console.error("Erro ao carregar dados do gráfico:", error);

    // Contagem de colaboradores por turno
    const contagem = {
        'Diarista': 0,
        'Plantonista Noturno': 0,
        'Plantonista Diurno': 0
    };

    data.forEach(item => {
        if (contagem[item.turno] !== undefined) {
            contagem[item.turno]++;
        }
    });

    const ctx = document.getElementById('graficoTurnos').getContext('2d');

    // Se o gráfico já existe, destruímos para criar um novo com dados atualizados
    if (meuGrafico) meuGrafico.destroy();

    meuGrafico = new Chart(ctx, {
        type: 'pie', // Gráfico de pizza
        data: {
            labels: Object.keys(contagem),
            datasets: [{
                data: Object.values(contagem),
                backgroundColor: ['#007bff', '#333333', '#28a745'], // Cores para cada turno
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function exportarParaExcel() {
    // 1. Capturar os dados da tabela
    const dados = [];
    const cabecalho = ["Nome", "Usuário", "Setor", "Turno"];
    dados.push(cabecalho);

    const linhas = tabelaCorpo.querySelectorAll("tr");
    
    if (linhas.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    linhas.forEach(linha => {
        if (linha.style.display !== "none") { // Exporta apenas o que está visível
            const colunas = linha.querySelectorAll("td");
            if (colunas.length >= 4) {
                dados.push([
                    colunas[0].innerText.trim(),
                    colunas[1].innerText.trim(),
                    colunas[2].innerText.trim(),
                    colunas[3].innerText.trim()
                ]);
            }
        }
    });

    // 2. Criar a estrutura do arquivo Excel usando a biblioteca SheetJS
    const wb = XLSX.utils.book_new(); // Cria um novo livro
    const ws = XLSX.utils.aoa_to_sheet(dados); // Converte o array para uma planilha

    // Ajustar largura das colunas automaticamente
    ws['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Colaboradores"); // Adiciona a aba

    // 3. Gerar o download do arquivo .xlsx
    XLSX.writeFile(wb, "relatorio_colaboradores_hosplog.xlsx");
    
    // 4. Registrar no seu sistema de auditoria
    registrarLog("EXPORTAÇÃO EXCEL", "Relatório .xlsx baixado");
}