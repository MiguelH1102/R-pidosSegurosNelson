require("dotenv").config();
 
 const express = require("express");
 const app = express();
 const {clienteRoutes} = require("./SRC/routes/clienteRoutes");
const {pedidoRoutes} = require("./SRC/routes/pedidoRoutes");
 const PORT = 8081;
 
 app.use(express.json());
 
 app.use('/', clienteRoutes);
 app.use('/', pedidoRoutes);
 
 app.listen(PORT, ()=>{
     console.log(`Servidor Rodando em http://localhost:${PORT}`)
 });