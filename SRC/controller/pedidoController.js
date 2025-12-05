const { pedidoModels } = require("../models/pedidoModels");
const { clienteModels } = require("../models/clienteModels");

/**
     * Controlador que lista todos os pedidos do Banco de Dados
     * 
     * @async
     * 
     * @function listarPedidos
     *  @returns {Promise<void>} Retorna uma respostas JSON com A lista de pedidos.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao buscar os pedidos.
     * 
     * @function criarPedido
     *  @returns {Promise<void>} Retorna uma respostas JSON com A criação de um pedidos.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao criar os pedidos.
     * 
     * @function atualizarPedido
     *  @returns {Promise<void>} Retorna uma respostas JSON com OS pedidos atualizados.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao atualizar os pedidos.
     * 
     * @function deletarPedido
     *  @returns {Promise<void>} Retorna uma respostas JSON vazia (201) caso deletado com sucesso.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao deletar os pedidos.
     * 
     * 
     * @param {object} req -Objeto da requisição (recebido do cliente HTTP);
     * @param {object} res -Objeto da resposta (enviado ao cliente HTTP);
     *
    
     */

const pedidoController = {

      // Listar todos os pedidos
    listarPedidos: async (req, res) => {
        try {
            const pedidos = await pedidoModels.buscarTodos(); // Busca todos os pedidos
            res.status(200).json(pedidos); // Retorna lista de pedidos
        } catch (error) {
            console.error("Erro ao listar pedidos:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao listar pedidos!" });
        }
    },

     // Criar um novo pedido
    criarPedido: async (req, res) => {
        try {
            const {
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorBaseKM,
                valorBaseKg,
                statusEntrega
            } = req.body;  // Recebe dados do pedido do body

            
            // Validação de campos obrigatórios
            if (!idCliente || !dataPedido || !tipoEntrega ||
                distanciaKM === undefined || pesoCarga === undefined ||
                valorBaseKM === undefined || valorBaseKg === undefined) {
                return res.status(400).json({ erro: "Campos obrigatórios não preenchidos!" });
            }

             // Validação do ID do cliente
            if (idCliente.length !== 36) {
                return res.status(400).json({ erro: "Id do Cliente inválido!" });
            }

             // Validação da data do pedido
            const data = new Date(dataPedido);
            if (isNaN(data.getTime())) {
                return res.status(400).json({ erro: "Data do pedido inválida!" });
            }

            // Verifica se o cliente existe
            const cliente = await clienteModels.buscarUm(idCliente);
            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Cliente não encontrado!" });
            }

            // Calcula valores base do pedido
            let valorDistancia = distanciaKM * valorBaseKM;
            let valorPeso = pesoCarga * valorBaseKg;
            let valorFinal = valorPeso + valorDistancia;

            let acrescimoEntrega = 0;
            let descontoEntrega = 0;
            let taxaEntregaFinal = 0;

             // Calcula acréscimo para entrega urgente
            if (tipoEntrega.toLowerCase() === "urgente") {
                acrescimoEntrega = valorFinal * 0.2;
                valorFinal += acrescimoEntrega;
            }

            // Aplica desconto se valor final > 500
            if (valorFinal > 500) {
                descontoEntrega = valorFinal * 0.1;
                valorFinal -= descontoEntrega;
            }

            // Aplica taxa extra se peso > 50
            if (pesoCarga > 50) {
                taxaEntregaFinal = 15;
                valorFinal += taxaEntregaFinal;
            }

             // Valida e define status da entrega
            let statusEntregaDefault = "calculado";
            if (statusEntrega) {
                const statusLower = statusEntrega.toLowerCase();
                if (statusLower !== "calculado" && statusLower !== "em transito" && statusLower !== "cancelado" && statusLower !== "entregue") {
                    return res.status(400).json({erro: "Status da entrega do pedido inválido!"});
                }

                statusEntregaDefault = statusEntrega;
            }

            // Cria o pedido no banco
            const idPedido = await pedidoModels.criarPedido(
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorBaseKM,
                valorBaseKg,
                valorDistancia,
                valorPeso,
                acrescimoEntrega,
                descontoEntrega,
                taxaEntregaFinal,
                valorFinal,
                statusEntregaDefault
            );

            res.status(201).json({
                message: "Pedido solicitado com sucesso!",
                idPedido
            });

        } catch (error) {
            console.error("Erro ao cadastrar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao cadastrar pedido!" });
        }
    },

   // Atualizar um pedido existente
   atualizarPedido: async (req, res) => {
    try {
        const { idPedido } = req.params; // Pega ID do pedido da URL
        const {
            idCliente,
            dataPedido,
            tipoEntrega,
            distanciaKM,
            pesoCarga,
            valorBaseKM,
            valorBaseKg,
            statusEntrega
        } = req.body; // Recebe dados do body

        // Valida ID do pedido
        if (!idPedido || idPedido.length !== 36) {
            return res.status(400).json({ erro: "ID do pedido inválido!" });
        }

        const pedido = await pedidoModels.buscarUm(idPedido); // Busca o pedido

        if (!pedido || !pedido[0]) {
            return res.status(404).json({ erro: "Pedido não encontrado!" });
        }

        // Valida ID do cliente se fornecido
        if (idCliente && idCliente.length !== 36) {
            return res.status(400).json({ erro: "ID do cliente inválido!" });
        }

        // Verifica se o cliente existe
        if (idCliente) {
            const cliente = await clienteModels.buscarUm(idCliente);
            if (!cliente || !cliente[0]) {
                return res.status(404).json({ erro: "Cliente não encontrado!" });
            }
        }

        // Valida status da entrega
        if (statusEntrega) {
            const statusLower = statusEntrega.toLowerCase();
            if (
                statusLower !== "calculado" &&
                statusLower !== "em transito" &&
                statusLower !== "cancelado" &&
                statusLower !== "entregue"
            ) {
                return res.status(400).json({ erro: "Status da entrega do pedido inválido!" });
            }
        }

        const atual = pedido[0]; // Dados atuais do pedido

        // Define valores atualizados ou mantém os antigos
        const idClienteAtualizado = idCliente ?? atual.idCliente;
        const dataPedidoAtualizado = dataPedido ?? atual.dataPedido;
        const tipoEntregaPedidoAtualizado = tipoEntrega ?? atual.tipoEntrega;
        const distanciaPedidoAtualizado = distanciaKM ?? atual.distanciaKM;
        const pesoPedidoAtualizado = pesoCarga ?? atual.pesoCarga;
        const valorBaseKMPedidoAtualizado = valorBaseKM ?? atual.valorBaseKM;
        const valorBaseKgPedidoAtualizado = valorBaseKg ?? atual.valorBaseKg;
        const statusEntregaAtualizado = statusEntrega ?? atual.statusEntrega;

        // Recalcula valores do pedido
        let valorDistancia = distanciaPedidoAtualizado * valorBaseKMPedidoAtualizado;
        let valorPeso = pesoPedidoAtualizado * valorBaseKgPedidoAtualizado;
        let valorFinal = valorPeso + valorDistancia;

        let acrescimoEntrega = 0;
        if (tipoEntregaPedidoAtualizado.toLowerCase() === "urgente") {
            acrescimoEntrega = valorFinal * 0.2;
            valorFinal += acrescimoEntrega;
        }

        let descontoEntrega = 0;
        if (valorFinal > 500) {
            descontoEntrega = valorFinal * 0.1;
            valorFinal -= descontoEntrega;
        }

        let taxaEntregaFinal = 0;
        if (pesoPedidoAtualizado > 50) {
            taxaEntregaFinal = 15;
            valorFinal += taxaEntregaFinal;
        }

        const idEntrega = atual.idEntrega; // Pega ID da entrega associada

        // Atualiza pedido e entrega no banco
        await pedidoModels.atualizarPedido(
            idPedido,
            idEntrega,
            idClienteAtualizado,
            dataPedidoAtualizado,
            tipoEntregaPedidoAtualizado,
            distanciaPedidoAtualizado,
            pesoPedidoAtualizado,
            valorBaseKMPedidoAtualizado,
            valorBaseKgPedidoAtualizado,
            valorDistancia,
            valorPeso,
            acrescimoEntrega,
            descontoEntrega,
            taxaEntregaFinal,
            valorFinal,
            statusEntregaAtualizado
        );

        res.status(201).json({
            message: "Pedido atualizado com sucesso!",
            idPedido,
            valorFinal
        });


    } catch (error) {
        console.error("Erro ao atualizar pedido:", error);
        res.status(500).json({ erro: "Erro interno no servidor ao atualizar pedido!" });
    }
},

    // Deletar um pedido
    deletarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params; // Pega ID do pedido da URL

             // Valida ID do pedido
            if (!idPedido || idPedido.length !== 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

             // Busca o pedido
            const pedido = await pedidoModels.buscarUm(idPedido);
    
            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }

            await pedidoModels.deletarPedido(idPedido); // Deleta pedido e entrega
    
            return res.status(200).json({ mensagem: "Pedido e entrega deletados com sucesso!" });
    
        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            return res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
        }
    }
}

module.exports = { pedidoController }; // Exporta o controller