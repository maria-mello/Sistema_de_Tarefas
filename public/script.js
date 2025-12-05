// a função 'carregarTarefas' seja executada assim que o HTML for carregado
document.addEventListener('DOMContentLoaded', carregarTarefas);

// Função auxiliar para criar o elemento <li> no DOM com base nos dados do BD
function criarItemTarefaDOM(tarefa) {
    const novaTarefa = document.createElement("li");
    // Armazena o ID do banco de dados no elemento HTML para futuras ações (DELETE/UPDATE)
    novaTarefa.setAttribute('data-id', tarefa.id); 
    
    // Define a classe 'concluida' se a tarefa vier como true do BD
    if (tarefa.concluida) {
        novaTarefa.classList.add('concluida');
    }

    // Estrutura do item: Texto da Tarefa e Botões de Ação
    novaTarefa.innerHTML = `
        <span onclick="toggleConcluir(${tarefa.id}, this)">${tarefa.descricao}</span>
        <div class="acoes">
            <button onclick="editarTarefa(${tarefa.id}, this)">✏️ Editar</button>
            <button onclick="excluirTarefa(${tarefa.id}, this)">🗑️ Excluir</button>
        </div>
    `;
    return novaTarefa;
}

// READ: Carregar tarefas do banco de dados ao iniciar a página
async function carregarTarefas() {
    const lista = document.getElementById("lista-tarefa");
    if (!lista) return;

    lista.innerHTML = ''; // Limpa a lista existente (se houver)

    try {
        // GET: Solicita todas as tarefas ao servidor (http://localhost:3000/api/tarefas)
        const response = await fetch('/api/tarefas');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const tarefas = await response.json();

        // Adiciona cada tarefa à lista na interface
        tarefas.forEach(tarefa => {
            const itemDOM = criarItemTarefaDOM(tarefa);
            lista.appendChild(itemDOM);
        });

    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        // Pode ser um erro de servidor não rodando ou de conexão
        lista.innerHTML = '<li>Erro ao carregar tarefas. Verifique se o servidor está rodando.</li>';
    }
}

// CREATE: Adicionar nova tarefa ao banco de dados
async function adicionar() {
    let descricao = document.getElementById("taref").value.trim();
    
    if (descricao === "") {
        alert("Campo vazio!");
        return;
    }

    try {
        // POST: Envia a nova descrição para a API
        const response = await fetch('/api/tarefas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ descricao }) // Corpo da requisição
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar a tarefa no servidor.');
        }

        const novaTarefa = await response.json(); // Recebe a tarefa (com o novo ID) de volta do BD

        const lista = document.getElementById("lista-tarefa"); 
        if (lista) {
             // Adiciona a nova tarefa no topo da lista
             lista.prepend(criarItemTarefaDOM(novaTarefa)); 
        }
       
        document.getElementById("taref").value = ""; // Limpa o input
    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        alert(`Erro ao adicionar: ${error.message}`);
    }
}

// UPDATE: Editar descrição da tarefa
async function editarTarefa(id, botao) {
    const itemTarefa = botao.closest('li');
    const spanTarefa = itemTarefa.querySelector('span');
    const textoAtual = spanTarefa.textContent;
    
    const novoTexto = prompt("Edite a tarefa:", textoAtual);
    
    if (novoTexto !== null && novoTexto.trim() !== "" && novoTexto.trim() !== textoAtual) {
        const descricao = novoTexto.trim();
        try {
            // PUT: Envia a nova descrição para a rota com o ID específico
            const response = await fetch(`/api/tarefas/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ descricao })
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar a tarefa.');
            }
            
            // Atualiza o DOM (interface) após o sucesso no BD
            spanTarefa.textContent = descricao;

        } catch (error) {
            console.error('Erro ao editar tarefa:', error);
            alert(`Erro ao editar: ${error.message}`);
        }
    } else if (novoTexto !== null && novoTexto.trim() === "") {
        alert("A edição não pode ser vazia.");
    }
}

// UPDATE: Marcar/Desmarcar como concluída
async function toggleConcluir(id, span) {
    const itemTarefa = span.closest('li');
    // Verifica o status atual (true se tem a classe 'concluida')
    const statusAtual = itemTarefa.classList.contains('concluida');
    const novoStatus = !statusAtual; // Inverte o status
    
    try {
        // PUT: Envia o novo status de 'concluida' para o BD
        const response = await fetch(`/api/tarefas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ concluida: novoStatus })
        });

        if (!response.ok) {
            throw new Error('Erro ao alterar status.');
        }
        
        // Atualiza o DOM, adicionando ou removendo a classe 'concluida'
        itemTarefa.classList.toggle('concluida', novoStatus);
        
    } catch (error) {
        console.error('Erro ao concluir tarefa:', error);
        alert(`Erro ao alterar status: ${error.message}`);
    }
}


// DELETE: Excluir tarefa do banco de dados
async function excluirTarefa(id, botao) {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
        try {
            // DELETE: Envia requisição para a rota de exclusão com o ID
            const response = await fetch(`/api/tarefas/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir a tarefa no servidor.');
            }
            
            // Remove o item do DOM (interface) após o sucesso no BD
            const itemTarefa = botao.closest('li');
            itemTarefa.remove();

        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            alert(`Erro ao excluir: ${error.message}`);
        }
    }
}