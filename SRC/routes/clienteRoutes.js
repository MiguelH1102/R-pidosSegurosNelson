const express = require("express");
const router = express.Router();
const {clienteController} = require("../controller/clienteController")

router.get("/clientes", clienteController.listarCliente)

router.post("/clientes", clienteController.criarCliente)

router.delete("/clientes/:idCliente", clienteController.deletarCliente)

router.put("/clientes/:idCliente", clienteController.atualizarCliente)



module.exports = {clienteRoutes: router};