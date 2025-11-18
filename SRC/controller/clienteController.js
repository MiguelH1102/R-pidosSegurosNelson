const {clienteModels} = require("../models/clienteModels");

const clienteController = {
    listarCliente: async (req, res) => {
        try {
            const {idCliente} = req.query;

            if(idCliente){
                if(idCliente.length != 36){
                    return res.status(400).json({erro: "id do cliente invalido"})
                }
                
                const cliente = await clienteModels.buscarUm(idCliente);
                
                return res.status(200).json(cliente)
            }
            
            const clientes = await clienteModels.buscarTodos();
            res.status(200).json(clientes);

        } catch (error) {
            console.error(`Erro ao listar todos os usuários`, error);
            res.status(500).json({messag: `Error ao buscar os clientes`});
        }

    },
    criarCliente: async (req, res)=>{
        try {
            
            const {nomeCliente, cpfCliente, telefoneCliente, emailCliente, enderecoCliente}= req.body;

            if(nomeCliente == undefined || cpfCliente == undefined || telefoneCliente == undefined || emailCliente == undefined || enderecoCliente == undefined){
                return res.status(400).json({erro:`Campos obrigatorios não preenchidos`});
            }

            const result = await clienteModels.buscarCpf(cpfCliente);
           if(result.length > 0){
            return res.status(409).json({message:`CPF já existe!`});
           }

          
            
           

            await clienteModels.inserirCliente(nomeCliente,cpfCliente, telefoneCliente, emailCliente, enderecoCliente);

            res.status(201).json({message:'Cliente cadastrado com sucesso!'});

        } catch (error) {
            console.error('Erro ao cadastrar o cliente', error);
            res.status(500).json({erro:'Erro no servidor ao cadastrar o cliente!'});
        }
    },
    deletarCliente: async (req, res) => {
        try {
            const {idCliente}= req.params;

            
            if (idCliente.length != 36) {
                return res.status(400).json({erro:'id do cliente invalido'})
            }

            const cliente = await clienteModels.buscarUm(idCliente);
            if(!cliente || cliente.length !== 1){
                return res.status(404).json({erro:'Cliente não encontrado!'})
            }

            await clienteModels.deletarCliente(idCliente)

            res.status(200).json({message:'Cliente deletado com sucesso'})
        } catch (error) {
            console.error('Erro ao deletar cliente', error);
            res.status(500).json({erro:"Erro no servidor ao deletar cliente"});
        }
    },
    atualizarCliente: async (req, res) => {

        try {
            const { idCliente } = req.params;
            const { nomeCliente, cpfCliente,telefoneCliente, emailCliente, enderecoCliente } = req.body;

            if (idCliente.length != 36) {
                return res.status(400).json({erro: 'id do Cliente inválido!'});
            }

            const cliente = await clienteModels.buscarUm(idCliente);

            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: 'cliente não encontrado!' });
            }
            const clienteAtual = cliente[0];

            const nomeAtualizado = nomeCliente ?? clienteAtual.nomeCliente;
            const cpfClienteAtualizado = cpfCliente ?? cpfClienteAtualizado.cpfCliente;
            const telefoneClienteAtualizado = telefoneCliente ?? telefoneClienteAtualizado.telefoneCliente;
            const emailClienteAtualizado = emailCliente ?? emailClienteAtualizado.emailCliente;
            const enderecoClienteAtualizado = enderecoCliente ?? enderecoClienteAtualizado.enderecoCliente


            await clienteModels.atualizarCliente(idCliente, nomeAtualizado, cpfCliente, telefoneCliente,
            emailCliente,enderecoCliente);

            res.status(200).json({ message: 'Cliente atualizado com sucesso' })

        } catch (error) {
            console.error('erro ao atualizar Cliente:',error)
            res.status(500).json({ erro: "Erro no servidor ao atualizar Cliente." });
        }
    },


}
module.exports = {clienteController};