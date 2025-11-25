const {sql, getConnection } = require("../config/db");

const entregaModels = {
buscarTodos: async () => {
        try {
            const pool = await getConnection();


            let sql = 'SELECT * FROM ENTREGAS'         


            const result = await pool.request().query(sql);


            return result.recordset;
        
        } catch (error) {
            console.error("Erro ao encontrar o tipo de entrega, error");
            throw error;
        }
    },
    buscarUm: async (idEntrega) =>{
        try {
            const pool = await getConnection();


            const querySQL = 'SELECT* FROM ENTREGAS WHERE idEntrega = @idEntrega';


            const result = await pool
                .request()
                .input('idEntrega', sql.UniqueIdentifier, idEntrega)
                .query(querySQL);


                return result.recordset;
        } catch (error) {
            console.error("Erro ao encontrar tipo de Encomenda", error);
            throw error;
        }

    },
    cancelarEntrega: async (idEntrega) => {
        try {
            const pool = await getConnection();
    
    
            const querySQL = 'DELETE FROM ENTREGAS WHERE idEntrega = @idEntrega'
    
    
            await pool.request()
            .input('idEntrega', sql.UniqueIdentifier, idEntrega)
            .query(querySQL);
        } catch (error) {
            console.error("Erro ao cancelar entrega, error");
            throw error;
        }
    }

}
module.exports = {entregaModels}