# 👥 Sistema de Gestão de Colaboradores (Full Stack)

Este projeto é uma solução prática desenvolvida para otimizar o controle de colaboradores e escalas na operação da **Hosplog**. O sistema evoluiu de um controle de inventário para uma plataforma completa de gestão de pessoal.

## 🚀 Funcionalidades
- **Autenticação Segura:** Acesso administrativo restrito via Supabase Auth.
- **Operações CRUD Completas:** Cadastro, visualização, edição e exclusão de colaboradores.
- **Busca em Tempo Real:** Filtro dinâmico por nome ou usuário diretamente na interface.
- **Segurança a Nível de Banco (RLS):** Proteção de dados garantida por Row Level Security no PostgreSQL.
- **Gestão de Escalas:** Controle específico de turnos (Diarista, Plantonista Diurno/Noturno) e setores.

## 🛠️ Tecnologias Utilizadas
- **Frontend:** HTML5, CSS3, JavaScript (ES6+ / Assíncrono)
- **Backend:** [Supabase](https://supabase.com/) (Backend-as-a-Service)
- **Banco de Dados:** PostgreSQL
- **Hospedagem:** GitHub Pages

## 🔒 Configuração de Segurança
O projeto utiliza **Row Level Security (RLS)** para garantir que apenas usuários autenticados possam realizar alterações críticas. As permissões de leitura são públicas, enquanto as de escrita (Insert/Update/Delete) são restritas a administradores cadastrados no sistema.

## 📂 Estrutura do Banco de Dados
A tabela `equipamentos` (mantida para compatibilidade) foi reestruturada com as seguintes colunas:
- `nome`: Nome completo do colaborador.
- `usuario`: Identificador de login/sistema.
- `setor`: Área de atuação (ex: TI, Logística).
- `turno`: Horário de trabalho.

## 👨‍💻 Autor
Desenvolvido por **Renan Souza** durante o curso de **ADS (Análise e Desenvolvimento de Sistemas)**.