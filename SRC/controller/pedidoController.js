const { pedidoModels } = require("../models/pedidoModels");
const { clienteModels } = require("../models/clienteModels");

const pedidoController = {
    listarPedidos: async (req, res) => {
        try {
            const pedidos = await pedidoModels.buscarTodos();
            res.status(200).json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedidos:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao listar pedidos!" });
        }
    },

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
            } = req.body;

            
            if (!idCliente || !dataPedido || !tipoEntrega ||
                distanciaKM == undefined || pesoCarga == undefined ||
                valorBaseKM == undefined || valorBaseKg == undefined) {
                return res.status(400).json({ erro: "Campos obrigatórios não preenchidos!" });
            }

            if (idCliente.length !== 36) {
                return res.status(400).json({ erro: "Id do Cliente inválido!" });
            }

            const data = new Date(dataPedido);
            if (isNaN(data.getTime())) {
                return res.status(400).json({ erro: "Data do pedido inválida!" });
            }

            const cliente = await clienteModels.buscarUm(idCliente);
            if (!cliente || cliente.length !== 1) {
                return res.status(404).json({ erro: "Cliente não encontrado!" });
            }

            
            let valorDistancia = distanciaKM * valorBaseKM;
            let valorPeso = pesoCarga * valorBaseKg;
            let valorFinal = valorPeso + valorDistancia;

            let acrescimoEntrega = 0;
            let descontoEntrega = 0;
            let taxaEntregaFinal = 0;


            if (tipoEntrega.toLowerCase() === "urgente") {
                acrescimoEntrega = valorFinal * 0.2;
                valorFinal += acrescimoEntrega;
            }

            
            if (valorFinal > 500) {
                descontoEntrega = valorFinal * 0.1;
                valorFinal -= descontoEntrega;
            }

            
            if (pesoCarga > 50) {
                taxaEntregaFinal = 15;
                valorFinal += taxaEntregaFinal;
            }

            let statusEntregaDefault = "calculado";
            if (statusEntrega) {
                if (statusEntrega.toLowerCase() != "calculado" && statusEntrega.toLowerCase() != "em transito" && statusEntrega.toLowerCase() != "cancelado" && statusEntrega.toLowerCase() != "entregue") {
                    return res.status(400).json({erro: "Status da entrega do pedido inválido!"});
                }

                statusEntregaDefault = statusEntrega;
            }

            
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

    atualizarPedido: async (req, res) => {
        try {
            const { idPedido } = req.params;
            const {
                idCliente,
                dataPedido,
                tipoEntrega,
                distanciaKM,
                pesoCarga,
                valorBaseKM,
                valorBaseKg,
                statusEntrega
            } = req.body;
    
            if (!idPedido || idPedido.length !== 36) {
                return res.status(400).json({ erro: "ID do pedido inválido!" });
            }
    
            const pedido = await pedidoModels.buscarUm(idPedido);
    
            
            if (!pedido || !pedido[0]) {
                return res.status(404).json({ erro: "Pedido não encontrado!" });
            }
    
            if (idCliente && idCliente.length !== 36) {
                return res.status(400).json({ erro: "ID do cliente inválido!" });
            }
    
            
            if (idCliente) {
                const cliente = await clienteModels.buscarUm(idCliente);
    
                if (!cliente || !cliente[0]) {
                    return res.status(404).json({ erro: "Cliente não encontrado!" });
                }
            }
    
            let valorDistancia = distanciaKM * valorBaseKM;
            let valorPeso = pesoCarga * valorBaseKg;
            let valorFinal = valorPeso + valorDistancia;
    
            let acrescimoEntrega = 0;
            let descontoEntrega = 0;
            let taxaEntregaFinal = 0;
    
            if (tipoEntrega && tipoEntrega.toLowerCase() === "urgente") {
                acrescimoEntrega = valorFinal * 0.2;
                valorFinal += acrescimoEntrega;
            }
    
            if (valorFinal > 500) {
                descontoEntrega = valorFinal * 0.1;
                valorFinal -= descontoEntrega;
            }
    
            if (pesoCarga > 50) {
                taxaEntregaFinal = 15;
                valorFinal += taxaEntregaFinal;
            }
    
            let statusEntregaDefault = "calculado";
    
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
    
                statusEntregaDefault = statusEntrega;
            }
    
            const atual = pedido[0];
    
            const idClienteAtualizado = idCliente ?? atual.idCliente;
            const dataPedidoAtualizado = dataPedido ?? atual.dataPedido;
            const tipoEntregaPedidoAtualizado = tipoEntrega ?? atual.tipoEntrega;
            const distanciaPedidoAtualizado = distanciaKM ?? atual.distanciaKM;
            const pesoPedidoAtualizado = pesoCarga ?? atual.pesoCarga;
            const valorBaseKMPedidoAtualizado = valorBaseKM ?? atual.valorBaseKM;
            const valorBaseKgPedidoAtualizado = valorBaseKg ?? atual.valorBaseKg;
            const valorDistanciaEntregaAtualizado = valorDistancia ?? atual.valorDistancia;
            const valorPesoEntregaAtualizado = valorPeso ?? atual.valorPeso;
            const valorFinalEntregaAtualizado = valorFinal ?? atual.valorFinal;
            const acrescimoEntregaAtualizado = acrescimoEntrega ?? atual.acreEntrega;
            const descontoEntregaAtualizado = descontoEntrega ?? atual.descEntrega;
            const taxaExtraEntregaAtualizado = taxaEntregaFinal ?? atual.taxaEntrega;
            const statusEntregaAtualizado = statusEntrega ?? atual.statusEntrega;
    
            await pedidoModels.atualizarPedido(
                idPedido,
                idClienteAtualizado,
                dataPedidoAtualizado,
                tipoEntregaPedidoAtualizado,
                distanciaPedidoAtualizado,
                pesoPedidoAtualizado,
                valorBaseKMPedidoAtualizado,
                valorBaseKgPedidoAtualizado,
                valorDistanciaEntregaAtualizado,
                valorPesoEntregaAtualizado,
                valorFinalEntregaAtualizado,
                acrescimoEntregaAtualizado,
                descontoEntregaAtualizado,
                taxaExtraEntregaAtualizado,
                statusEntregaAtualizado
            );
    
            res.status(200).json({ mensagem: "Pedido atualizado com sucesso!" });
    
        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            res.status(500).json({ erro: "Erro interno no servidor ao atualizar pedido!" });
        }
    },

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

module.exports = { pedidoController };