// Selecionando os elementos do HTML
const form = document.getElementById('equipamento-form');
const tabelaCorpo = document.getElementById('tabela-corpo');

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