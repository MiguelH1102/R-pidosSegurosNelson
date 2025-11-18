const {entregaModels} = require("../models/entregaModels");

const entregaController = {
    listarEntregas: async (req, res) => {
        try {
            const {idEntrega} = req.query;

            if(idEntrega){
                if(idEntrega.length != 36){
                    return res.status(400).json({erro: "id do cliente invalido"})
                }
                
                const entrega = await entregaModels.buscarUm(idEntrega);
                
                return res.status(200).json(entrega)
            }
            
            const entregas = await entregaModels.buscarTodos();
            res.status(200).json(entregas);


        } catch (error) {
            console.error(`Erro ao listar todas as entregas`, error);
            res.status(500).json({messag: `Error ao buscar as entregas`});
        }
    }

}

module.exports = {entregaController}