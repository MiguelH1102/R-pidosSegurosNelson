const express = require("express");
const router = express.Router();
const {entregaController} = require("../controller/entregaController")

//lista as entregas metodo GET
router.get("/entregas", entregaController.listarEntregas)


module.exports = {entregaRoutes: router}  // Exporta o routes