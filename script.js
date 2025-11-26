function adicionar() {
    let tarefa = document.getElementById("taref").value.trim(); // Pega o valor q está no input e remove espaços em branco
    
    if (tarefa === "") {
        alert("Campo vazio!"); //verifica se está vazio e retorna um alerta
    } else {
        const novaTarefa = document.createElement("li"); //  Cria um novo elemento <li>
        novaTarefa.textContent = tarefa;
        
        const lista = document.getElementById("lista-tarefa"); 
        
        if (lista) { // Verifica se a lista foi encontrada
            lista.appendChild(novaTarefa);
            
            document.getElementById("taref").value = "";
            alert("Tarefa registrada com sucesso!");
        } 
    }
}