const {clienteModels} = require("../models/clienteModels");
const {pedidoModels} = require("../models/pedidoModels");

/**
     * Controlador que lista todos os clientes do Banco de Dados
     * 
     * @async
     * @function listarCliente
     *  @returns {Promise<void>} Retorna uma respostas JSON com A listar cliente.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao listar os clientes.


     * @function criarCliente
     *  @returns {Promise<void>} Retorna uma respostas JSON com (200) clientes criado.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao criar os clientes.

  * @function deletarCliente
     *  @returns {Promise<void>} Retorna uma respostas JSON com (201) clientes deletado.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao deletar os clientes && erro o cliente tem pedidos associados.


  * @function atualizarCliente
     *  @returns {Promise<void>} Retorna uma respostas JSON com (200) clientes atualizado.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao atualizar os clientes.


     * @param {object} req -Objeto da requisição (recebido do cliente HTTP);
     * @param {object} res -Objeto da resposta (enviado ao cliente HTTP);
    
     */


const clienteController = {
    listarCliente: async (req, res) => {
         // Listar clientes (todos ou por ID)
        try {
            const {idCliente} = req.query;

            if(idCliente){
                if(idCliente.length != 36){
                    return res.status(400).json({erro: "id do cliente invalido"}) // Valida ID do cliente
                }
                
                const cliente = await clienteModels.buscarUm(idCliente); // Busca cliente por ID
                
                return res.status(200).json(cliente) // Retorna cliente encontrado
            }
            
            
            const clientes = await clienteModels.buscarTodos(); ; // Busca todos os clientes
            res.status(200).json(clientes);  // Retorna lista de clientes

        } catch (error) {
            console.error(`Erro ao listar todos os usuários`, error); // Log de erro
            res.status(500).json({message: `Error ao buscar os clientes`});  // Retorna erro 500
        }

    },

     // Criar um novo cliente
    criarCliente: async (req, res)=>{
        try {
            
            const {nomeCliente, cpfCliente, telefoneCliente, emailCliente, enderecoCliente}= req.body;
            
            // Valida campos obrigatórios
            if(nomeCliente == undefined || cpfCliente == undefined || telefoneCliente == undefined || emailCliente == undefined || enderecoCliente == undefined){
                return res.status(400).json({erro:`Campos obrigatorios não preenchidos`});
            }

            const result = await clienteModels.buscarCpf(cpfCliente);  // Verifica CPF duplicado
           if(result.length > 0){
            return res.status(409).json({message:`CPF já existe!`});
           }
           const result1 = await clienteModels.buscarEmail(emailCliente); // Verifica email duplicado
           if(result1.length > 0){
            return res.status(409).json({message:`Email já existe!`});
           }
           if (!emailCliente.includes("@")) {  // Valida formato do email
            return res.status(400).json({erro:`Está faltando o @`});
           }
           
          await clienteModels.inserirCliente(nomeCliente,cpfCliente, telefoneCliente, emailCliente, enderecoCliente); // Insere cliente

            res.status(201).json({message:'Cliente cadastrado com sucesso!'}); // Retorna sucesso

        } catch (error) {
            console.error('Erro ao cadastrar o cliente', error); // Log de erro
            res.status(500).json({erro:'Erro no servidor ao cadastrar o cliente!'}); // Retorna erro 500
        }
    },

    // Deletar um cliente
    deletarCliente: async (req, res) => {
        try {
            const {idCliente}= req.params;

            // Valida ID do cliente
            if (idCliente.length != 36) {
                return res.status(400).json({erro:'id do cliente invalido'})
            }

            const cliente = await clienteModels.buscarUm(idCliente); // Busca cliente
            if(!cliente || cliente.length !== 1){
                return res.status(404).json({erro:'Cliente não encontrado!'}) // Cliente não encontrado
            }
            const pedido = await pedidoModels.buscarPorCliente(idCliente); 

            
            
            if(pedido.length > 0 ) {
                return res.status(409).json({message: "Este cliente não pode ser deletado, ele tem pedido"});  // Verifica se cliente possui pedidos
            }
            await clienteModels.deletarCliente(idCliente) // Deleta cliente

            res.status(200).json({message:'Cliente deletado com sucesso'}) // Retorna sucesso
        } catch (error) {
            console.error('Erro ao deletar cliente', error); // Log de erro
            res.status(500).json({erro:"Erro no servidor ao deletar cliente"}); // Retorna erro 500
        }
    },

    // Atualizar um cliente
    atualizarCliente: async (req, res) => {

        try {
            const { idCliente } = req.params;
            const { nomeCliente, cpfCliente,telefoneCliente, emailCliente, enderecoCliente } = req.body;

              // Valida ID do cliente
            if (idCliente.length != 36) {
                return res.status(400).json({erro: 'id do Cliente inválido!'});
            }

            const cliente = await clienteModels.buscarUm(idCliente);  // Busca cliente

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: 'cliente não encontrado!' });  // Cliente não encontrado
            }
            const clienteAtual = cliente[0]; // Dados atuais do cliente


            // Define valores atualizados ou mantém os antigos
            const nomeAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? clienteAtual.cpfCliente;
            const telefoneClienteAtualizado = telefoneCliente ?? clienteAtual.telefoneCliente;
            const emailClienteAtualizado = emailCliente ?? clienteAtual.emailCliente;
            const enderecoClienteAtualizado = enderecoCliente ?? clienteAtual.enderecoCliente;

             // Verifica se CPF já existe
            if (cpfCliente && cpfCliente !== clienteAtual.cpfCliente) {
                const cpfExistente = await clienteModels.buscarCpf(cpfCliente);
                if (cpfExistente.length > 0) {
                    return res.status(409).json({message: 'CPF já existe!'});
                }
            }

             // Verifica se email já existe
            if (emailCliente && emailCliente !== clienteAtual.emailCliente) {
                const emailExistente = await clienteModels.buscarEmail(emailCliente);
                if (emailExistente.length > 0) {
                    return res.status(409).json({message: 'Email já existe!'});
                }
            }

            await clienteModels.atualizarCliente(idCliente, nomeAtualizado, cpfClienteAtualizado, telefoneClienteAtualizado,
            emailClienteAtualizado, enderecoClienteAtualizado); // Atualiza cliente

            res.status(200).json({ message: 'Cliente atualizado com sucesso' })

        } catch (error) {
            console.error('erro ao atualizar Cliente:',error) // Log de erro
            res.status(500).json({ erro: "Erro no servidor ao atualizar Cliente." }); // Retorna erro 500
        }
    },


}
module.exports = {clienteController}; // Exporta o controller