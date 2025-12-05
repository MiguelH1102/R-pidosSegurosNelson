const {entregaModels} = require("../models/entregaModels");

/** controlador que controla as entregas
@async
@function listarEntregas
 @returns {Promise<void>} Retorna uma respostas JSON com A lista de Entregas.
@throws Mostra no console e retorna o erro 500 se ocorrer falha ao listar Entregas.
 * 
 */


const entregaController = {

     // Método GET – Lista entregas
    listarEntregas: async (req, res) => {
        try {
            const {idEntrega} = req.query;

             // Se o usuário enviou um ID específico, buscamos apenas uma entrega
            if(idEntrega){
                if(idEntrega.length != 36){  // Validação básica do ID (tamanho)
                    return res.status(400).json({erro: "id do cliente invalido"})
                }
                
                
                const entrega = await entregaModels.buscarUm(idEntrega);  // Busca apenas uma entrega pelo ID
                
                return res.status(200).json(entrega)
            }
            
            const entregas = await entregaModels.buscarTodos(); // Caso o usuário não envie um ID, retorna todas as entregas
            res.status(200).json(entregas);


        } catch (error) {
            console.error(`Erro ao listar todas as entregas`, error);
            res.status(500).json({messag: `Error ao buscar as entregas`});
        }
    }
    
    
}

module.exports = {entregaController} // Exporta o controller