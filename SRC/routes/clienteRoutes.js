const express = require("express");
const router = express.Router();
const {clienteController} = require("../controller/clienteController")

//rota cliente medoto GET (buscar)
router.get("/clientes", clienteController.listarCliente)

//rota cliente medoto POST (criar)
router.post("/clientes", clienteController.criarCliente)

//rota cliente medoto DELETE (deletar)
router.delete("/clientes/:idCliente", clienteController.deletarCliente)

//rota cliente metodo PUT (atualizar)
router.put("/clientes/:idCliente", clienteController.atualizarCliente)



module.exports = {clienteRoutes: router}