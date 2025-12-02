const { pedidoModels } = require("../models/pedidoModels");
const { clienteModels } = require("../models/clienteModels");
const {entregaModels} = require("../models/entregaModels")

/**
     * Controlador que lista todos os pedidos do Banco de Dados
     * 
     * @async
     * @function listarPedidos
     * @param {object} req -Objeto da requisição (recebido do cliente HTTP);
     * @param {object} res -Objeto da resposta (enviado ao cliente HTTP);
     * @returns {Promise<void>} Retorna uma respostas JSON com A lista de pedidos.
     * @throws Mostra no console e retorna o erro 500 se ocorrer falha ao buscar os pedidos.
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
            const { idPedido } = req.params;
            const {
                idCliente,
                dataPedido,
                tipoEntregaPedido,
                distanciaPedido,
                pesoPedido,
                valorBaseKmPedido,
                valorBaseKgPedido,
                statusEntrega
            } = req.body;
    
            // Verifica a validade do ID
            if (idPedido.length !== 36) {
                return res.status(400).json({ errp: "ID do pedido inválido!" });
            }
    
            // Busca o pedido
            const pedido = await pedidoModels.buscarUm(idPedido);
            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ errp: "Pedido não encontrado!" });
            }
            const pedidoAtual = pedido[0];
    
            // Se fornecido, verifica o cliente
            let idClienteAtualizado = pedidoAtual.idCliente;
            if (idCliente) {
                if (idCliente.length !== 36) {
                    return res.status(400).json({ erro: "ID do cliente inválido!" });
                }
                const cliente = await clienteModels.buscarUm(idCliente);
                if (!cliente || cliente.length !== 1) {
                    return res.status(404).json({ erro: "Cliente não encontrado!" });
                }
                idClienteAtualizado = idCliente;
            }
    
            // Atualiza os campos que vieram no body, mantendo os antigos para os que não vieram
            const dataPedidoAtualizado = dataPedido ?? pedidoAtual.dataPedido;
            const tipoEntregaAtualizado = tipoEntregaPedido ?? pedidoAtual.tipoEntregaPedido;
            const distanciaAtualizado = distanciaPedido ?? pedidoAtual.distanciaPedido;
            const pesoAtualizado = pesoPedido ?? pedidoAtual.pesoPedido;
            const valorBaseKmAtualizado = valorBaseKmPedido ?? pedidoAtual.valorBaseKmPedido;
            const valorBaseKgAtualizado = valorBaseKgPedido ?? pedidoAtual.valorBaseKgPedido;
            const statusEntregaAtualizado = statusEntrega ?? pedidoAtual.statusEntrega;
    
            // Recalcula valores
            let valorDistanciaEntrega = distanciaAtualizado * valorBaseKmAtualizado;
            let valorPesoEntrega = pesoAtualizado * valorBaseKgAtualizado;
            let valorFinalEntrega = valorDistanciaEntrega + valorPesoEntrega;
    
            let acrescimoEntrega = 0;
            let taxaExtraEntrega = 0;
            let descontoEntrega = 0;
    
            // Acréscimo por entrega urgente
            if (tipoEntregaAtualizado.toLowerCase() == "urgente") {
                acrescimoEntrega = valorFinalEntrega * 0.2;
                valorFinalEntrega += acrescimoEntrega;
            }
    
            // Taxa extra por peso acima de 50
            if (pesoAtualizado > 50) {
                taxaExtraEntrega = 15;
                valorFinalEntrega += taxaExtraEntrega;
            }
    
            // Desconto se o valor final for maior que 500
            if (valorFinalEntrega > 500) {
                descontoEntrega = valorFinalEntrega * 0.1;
                valorFinalEntrega -= descontoEntrega;
            }
    
            // Atualiza no banco
            await pedidoModels.atualizarPedido(
                idPedido,
                idClienteAtualizado,
                dataPedidoAtualizado,
                tipoEntregaAtualizado,
                distanciaAtualizado,
                pesoAtualizado,
                valorBaseKmAtualizado,
                valorBaseKgAtualizado,
                valorDistanciaEntrega,
                valorPesoEntrega,
                descontoEntrega,
                acrescimoEntrega,
                taxaExtraEntrega,
                valorFinalEntrega,
                statusEntregaAtualizado
            );
    
            res.status(200).json({ message: "Pedido e entrega atualizado com sucesso!" });
    
        } catch (err) {
            console.error(err);
            res.status(500).json({ erro: "Erro ao atualizar pedido." });
        }
    },

    // Deletar um pedido
    deletarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;

            if (!idPedido || idPedido.length !== 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }

            const pedido = await pedidoModels.buscarUm(idPedido);
    
            if (!pedido || pedido.length !== 1) {
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }

            await pedidoModels.deletarPedido(idPedido);
    
            return res.status(200).json({ mensagem: "Pedido e entrega deletados com sucesso!" });
    
        } catch (error) {
            console.error("Erro ao deletar pedido:", error);
            return res.status(500).json({ erro: "Erro interno no servidor ao deletar pedido!" });
        }
    }
}

module.exports = { pedidoController }; // Exporta o controller