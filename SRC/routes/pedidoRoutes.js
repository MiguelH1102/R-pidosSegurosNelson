const express = require("express");
const router = express.Router(); 
const {pedidoController} = require("../controller/pedidoController");

router.get("/pedidos", pedidoController.listarPedidos);
router.post("/pedidos", pedidoController.criarPedido);
router.put("/pedidos/:idPedido", pedidoController.atualizarPedido);

module.exports = {pedidoRoutes: router}