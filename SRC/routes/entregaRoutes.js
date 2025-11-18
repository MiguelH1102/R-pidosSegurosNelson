const express = require("express");
const router = express.Router();
const {entregaController} = require("../controller/entregaController")

router.get("/entregas", entregaController.listarEntregas)


module.exports = {entregaRoutes: router}