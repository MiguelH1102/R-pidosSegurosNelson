const express = require("express");
const router = express.Router(); 
const {pedidoController} = require("../controller/pedidoController");

//metodo GET (buscar os pedido)
router.get("/pedidos", pedidoController.listarPedidos);

//metodo POST (criar os pedido)
router.post("/pedidos", pedidoController.criarPedido);

//metodo PUT (atualizar pedido)
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);

//metodo DELETE (deletar Pedido)
router.delete("/pedidos/:idPedido", pedidoController.deletarPedido);

module.exports = {pedidoRoutes: router}