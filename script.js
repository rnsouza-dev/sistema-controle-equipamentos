let ordemDirecao = 1; // 1 para ascendente, -1 para descendente
let colunaAtual = null;
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
    atualizarDashboard()
});

async function fazerLogin() {
    const email = prompt("E-mail do Administrador:");
    const password = prompt("Senha:");
    
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        mostrarToast("Acesso negado: " + error.message, "error"); // Substituído
    } else {
        mostrarToast("Bem-vindo, Administrador!", "success"); // Substituído
        configurarInterface(data.session);
        carregarDados();
        atualizarDashboard();
    }
}

async function fazerLogout() {
    await _supabase.auth.signOut();
    // Em vez de recarregar a página toda, limpamos a interface
    configurarInterface(null);
    carregarDados();
    atualizarDashboard();
}

function configurarInterface(session) {
    const btnLogin = document.getElementById('btn-login');
    const userInfo = document.getElementById('user-info');
    const userEmail = document.getElementById('user-email');
    const cadastroSection = document.getElementById('cadastro');
    const thAcoes = document.getElementById('th-acoes'); // Nova referência

    if (session) {
        btnLogin.style.display = 'none';
        userInfo.style.display = 'block';
        userEmail.innerText = session.user.email;
        cadastroSection.style.setProperty('display', 'block', 'important');
        if (thAcoes) thAcoes.style.display = ''; // Mostra o cabeçalho "Ações"
    } else {
        btnLogin.style.display = 'block';
        userInfo.style.display = 'none';
        cadastroSection.style.setProperty('display', 'none', 'important');
        if (thAcoes) thAcoes.style.display = 'none'; // Esconde o cabeçalho "Ações"
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
    const { data: { session } } = await _supabase.auth.getSession(); // Verifica login
    const { data, error } = await _supabase.from('equipamentos').select('*');

    if (error) return console.error(error);

    tabelaCorpo.innerHTML = "";
    data.forEach(item => {
        const linha = document.createElement('tr');
        
        // Colunas de dados comuns
        let html = `
            <td>${item.nome}</td>
            <td>${item.usuario}</td>
            <td>${item.setor}</td>
            <td>${item.turno}</td>
        `;

        // Só adiciona a coluna de ações se o usuário for ADMIN (estiver logado)
        if (session) {
            html += `
                <td>
                    <button class="btn-edit" onclick="prepararEdicao('${item.id}', '${item.nome}', '${item.usuario}', '${item.setor}', '${item.turno}')">✏️</button>
                    <button class="btn-delete" onclick="removerItem('${item.id}')">🗑️</button>
                </td>
            `;
        }

        linha.innerHTML = html;
        tabelaCorpo.appendChild(linha);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        nome: document.getElementById('nome').value,
        usuario: document.getElementById('usuario').value,
        setor: document.getElementById('setor').value,
        turno: document.getElementById('turno').value
    };

    if (idEdicao) {
        const { error, status } = await _supabase.from('equipamentos').update(dados).eq('id', idEdicao);

        if (error || status === 403) {
            mostrarToast("Erro: Sem permissão para editar.", "error"); // Substituído
        } else {
            await registrarLog("EDIÇÃO", dados.nome);
            mostrarToast("Colaborador atualizado com sucesso!"); // Substituído
            idEdicao = null;
            form.querySelector('button').innerText = "Adicionar";
        }
    } else {
        const { error } = await _supabase.from('equipamentos').insert([dados]);
        
        if (error) {
            mostrarToast("Erro ao salvar no banco de dados.", "error"); // Substituído
        } else {
            await registrarLog("CADASTRO", dados.nome);
            mostrarToast("Novo colaborador cadastrado!"); // Substituído
        }
    }

    carregarDados();
    form.reset();
    atualizarDashboard();
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

async function removerItem(id) {
    if (confirm("Deseja excluir este item?")) {
        const { error } = await _supabase.from('equipamentos').delete().eq('id', id);
        if (error) {
            mostrarToast("Erro: Apenas administradores podem excluir.", "error"); // Substituído
        } else {
            await registrarLog("EXCLUSÃO", "ID: " + id);    
            mostrarToast("Colaborador removido da base.", "success"); // Substituído
            await carregarDados();
            await atualizarDashboard();
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

async function atualizarDashboard() {
    const { data, error } = await _supabase.from('equipamentos').select('turno');
    
    if (error) return console.error("Erro ao carregar dashboard:", error);

    const contagem = {
        'Diarista': 0,
        'Plantonista Noturno': 0,
        'Plantonista Diurno': 0
    };

    // Conta os colaboradores por turno
    data.forEach(item => {
        if (contagem[item.turno] !== undefined) {
            contagem[item.turno]++;
        }
    });

    // Atualiza os números na tela
    document.getElementById('qtd-diarista').innerText = contagem['Diarista'];
    document.getElementById('qtd-noturno').innerText = contagem['Plantonista Noturno'];
    document.getElementById('qtd-diurno').innerText = contagem['Plantonista Diurno'];
}

function exportarParaExcel() {
    // 1. Capturar os dados da tabela
    const dados = [];
    const cabecalho = ["Nome", "Usuário", "Setor", "Turno"];
    dados.push(cabecalho);

    const linhas = tabelaCorpo.querySelectorAll("tr");
    
    if (linhas.length === 0) {
        mostrarToast("Não há dados para exportar.", "error"); // Substituído
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

    XLSX.writeFile(wb, "relatorio_hosplog.xlsx");
    mostrarToast("Relatório Excel gerado!"); // Adicionado feedback
    registrarLog("EXPORTAÇÃO EXCEL", "Relatório baixado");
}


// Listener para o input de arquivo
document.getElementById('inputImportar').addEventListener('change', function(e) {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = async function(e) {
        const dadosPlanilha = new Uint8Array(e.target.result);
        const workbook = XLSX.read(dadosPlanilha, { type: 'array' });

        // Pega a primeira aba da planilha
        const nomeAba = workbook.SheetNames[0];
        const aba = workbook.Sheets[nomeAba];

        // Converte para JSON (cada linha vira um objeto)
        const listaParaImportar = XLSX.utils.sheet_to_json(aba);

        if (confirm(`Deseja importar ${listaParaImportar.length} colaboradores?`)) {
            await processarImportacao(listaParaImportar);
        }
    };

    leitor.readAsArrayBuffer(arquivo);
});

async function processarImportacao(lista) {
    // ... mapeamento de dados ...
    const { error } = await _supabase.from('equipamentos').insert(dadosFormatados);

    if (error) {
        mostrarToast("Falha na importação. Verifique o arquivo.", "error"); // Substituído
    } else {
        await registrarLog("IMPORTAÇÃO EM MASSA", `${dadosFormatados.length} registros`);
        mostrarToast(`${dadosFormatados.length} colaboradores importados com sucesso!`); // Substituído
        carregarDados();
        atualizarDashboard();
        document.getElementById('inputImportar').value = ""; 
    }
}

// Função auxiliar para desenhar a tabela sem buscar no banco novamente
function renderizarTabelaOrdenada(dados, session) {
    tabelaCorpo.innerHTML = "";
    dados.forEach(item => {
        const linha = document.createElement('tr');
        let html = `
            <td>${item.nome}</td>
            <td>${item.usuario}</td>
            <td>${item.setor}</td>
            <td>${item.turno}</td>
        `;

        if (session) {
            html += `
                <td>
                    <button class="btn-edit" onclick="prepararEdicao('${item.id}', '${item.nome}', '${item.usuario}', '${item.setor}', '${item.turno}')">✏️</button>
                    <button class="btn-delete" onclick="removerItem('${item.id}')">🗑️</button>
                </td>
            `;
        }
        linha.innerHTML = html;
        tabelaCorpo.appendChild(linha);
    });
}

async function ordenarTabela(coluna) {
    const { data: { session } } = await _supabase.auth.getSession();
    const { data, error } = await _supabase.from('equipamentos').select('*');

    if (error) return console.error(error);

    // Inverte a direção se clicar na mesma coluna
    if (colunaAtual === coluna) {
        ordemDirecao *= -1;
    } else {
        ordemDirecao = 1;
        colunaAtual = coluna;
    }

    // Lógica de ordenação alfabética
    data.sort((a, b) => {
        const valorA = String(a[coluna]).toLowerCase();
        const valorB = String(b[coluna]).toLowerCase();
        
        if (valorA < valorB) return -1 * ordemDirecao;
        if (valorA > valorB) return 1 * ordemDirecao;
        return 0;
    });

    // Redesenha a tabela com os dados ordenados
    renderizarTabelaOrdenada(data, session);
}

function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span>${mensagem}</span>`;

    container.appendChild(toast);

    // Remove o toast após 3 segundos
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}