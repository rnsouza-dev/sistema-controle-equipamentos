const form = document.getElementById('equipamento-form');
const tabelaCorpo = document.getElementById('tabela-corpo');

// Carrega os dados assim que a página abre
document.addEventListener('DOMContentLoaded', carregarDados);

form.addEventListener('submit', function(event) {
    event.preventDefault();

    const novoItem = {
        nome: document.getElementById('nome').value,
        serie: document.getElementById('serie').value,
        status: document.getElementById('status').value
    };

    salvarEquipamento(novoItem);
    adicionarLinhaTabela(novoItem);
    form.reset();
});

function adicionarLinhaTabela(item) {
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.serie}</td>
        <td>${item.status}</td>
        <td><button onclick="removerItem('${item.serie}', this)" style="background-color: #dc3545; color: white; border: none; padding: 5px; cursor: pointer;">Excluir</button></td>
    `;
    tabelaCorpo.appendChild(novaLinha);
}

function salvarEquipamento(item) {
    // Busca o que já tem ou cria uma lista vazia
    let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
    equipamentos.push(item);
    // Salva de volta no "baú" do navegador
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));
}

function carregarDados() {
    let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
    equipamentos.forEach(item => adicionarLinhaTabela(item));
}

function removerItem(serie, botao) {
    let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [];
    // Filtra a lista para remover o item com aquela série
    equipamentos = equipamentos.filter(item => item.serie !== serie);
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));
    // Remove a linha da tabela visualmente
    botao.parentElement.parentElement.remove();
}