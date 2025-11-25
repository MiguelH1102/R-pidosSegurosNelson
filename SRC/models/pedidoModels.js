const {sql, getConnection} = require("../config/db")

const pedidoModels = {
    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            const querySQL = `
            SELECT*
            FROM PEDIDOS
            INNER JOIN CLIENTES ON CLIENTES.idCliente = PEDIDOS.idCliente
            `

            const result = await pool.request()
                .query(querySQL);

                return result.recordset

        } catch (error) {
            console.error("Erro ao buscar pedido", error);
            throw error;
        }
    },

    buscarUm: async (idPedido) => {
        try {
            const pool = await getConnection();

            const querySQL = "SELECT* FROM PEDIDOS WHERE idPedido = @idPedido";

            const result = await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

                return result.recordset;
        } catch (error) {
            console.error("Erro ao buscar o pedido", error);
            throw error;
        }
    },
    criarPedido: async (idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorBaseKM,valorBaseKg, valorDistancia, valorPeso, acreEntrega, descEntrega, taxaEntrega, valorFinal,
    statusEntrega
    ) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
    
        await transaction.begin();
    
        try {
    
            
            
            const queryPedido = `
                INSERT INTO PEDIDOS (
                    idCliente, dataPedido, tipoEntrega,
                    distanciaKM, pesoCarga, valorBaseKM, valorBaseKg
                )
                OUTPUT INSERTED.idPedido
                VALUES (
                    @idCliente, @dataPedido, @tipoEntrega,
                    @distanciaKM, @pesoCarga, @valorBaseKM, @valorBaseKg
                )
            `;
    
            const resultPedido = await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntrega", sql.VarChar(7), tipoEntrega)
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)
                .input("pesoCarga", sql.Decimal(10, 2), pesoCarga)
                .input("valorBaseKM", sql.Decimal(10, 2), valorBaseKM)
                .input("valorBaseKg", sql.Decimal(10, 2), valorBaseKg)
                .query(queryPedido);
    
            const idPedido = resultPedido.recordset[0].idPedido;
    
    
            
            const queryEntrega = `
                INSERT INTO ENTREGAS (
                    idPedido, valorDistancia, valorPeso,
                    acreEntrega, descEntrega, taxaEntrega,
                    valorFinal, statusEntrega
                )
                OUTPUT INSERTED.idEntrega
                VALUES (
                    @idPedido, @valorDistancia, @valorPeso,
                    @acreEntrega, @descEntrega, @taxaEntrega,
                    @valorFinal, @statusEntrega
                )
            `;
    
            const resultEntrega = await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia)
                .input("valorPeso", sql.Decimal(10, 2), valorPeso)
                .input("acreEntrega", sql.Decimal(10, 2), acreEntrega)
                .input("descEntrega", sql.Decimal(10, 2), descEntrega)
                .input("taxaEntrega", sql.Decimal(10, 2), taxaEntrega)
                .input("valorFinal", sql.Decimal(10, 2), valorFinal)
                .input("statusEntrega", sql.VarChar(11), statusEntrega)
                .query(queryEntrega);
    
            await transaction.commit();
    
            return {
                idPedido,
                idEntrega: resultEntrega.recordset[0].idEntrega
            };
    
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao inserir pedido", error);
            throw error;
        }
    },
    atualizarPedido: async (
        idPedido,
        idEntrega,
        idCliente,
        dataPedido,
        tipoEntrega,
        distanciaKM,
        pesoCarga,
        valorBaseKM,
        valorBaseKg,
        valorDistancia,
        valorPeso,
        acreEntrega,
        descEntrega,
        taxaEntrega,
        valorFinal,
        statusEntrega
    ) => {
    
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
    
        await transaction.begin();
    
        try {
    
           
            const queryPedido = `
                UPDATE PEDIDOS
                SET
                    idCliente = @idCliente,
                    dataPedido = @dataPedido,
                    tipoEntrega = @tipoEntrega,
                    distanciaKM = @distanciaKM,
                    pesoCarga = @pesoCarga,
                    valorBaseKM = @valorBaseKM,
                    valorBaseKg = @valorBaseKg
                WHERE idPedido = @idPedido;
            `;
    
            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntrega", sql.VarChar(7), tipoEntrega)
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)
                .input("pesoCarga", sql.Decimal(10, 2), pesoCarga)
                .input("valorBaseKM", sql.Decimal(10, 2), valorBaseKM)
                .input("valorBaseKg", sql.Decimal(10, 2), valorBaseKg)
                .query(queryPedido);
    
    
            
            const queryEntrega = `
                UPDATE ENTREGAS
                SET
                    valorDistancia = @valorDistancia,
                    valorPeso = @valorPeso,
                    acreEntrega = @acreEntrega,
                    descEntrega = @descEntrega,
                    taxaEntrega = @taxaEntrega,
                    valorFinal = @valorFinal,
                    statusEntrega = @statusEntrega
                WHERE idEntrega = @idEntrega;
            `;
    
            await transaction.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega)
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia)
                .input("valorPeso", sql.Decimal(10, 2), valorPeso)
                .input("acreEntrega", sql.Decimal(10, 2), acreEntrega)
                .input("descEntrega", sql.Decimal(10, 2), descEntrega)
                .input("taxaEntrega", sql.Decimal(10, 2), taxaEntrega)
                .input("valorFinal", sql.Decimal(10, 2), valorFinal)
                .input("statusEntrega", sql.VarChar(11), statusEntrega)
                .query(queryEntrega);
    
    
            // Commit
            await transaction.commit();
    
            return {
                mensagem: "Pedido e entrega atualizados com sucesso",
                idPedido,
                idEntrega
            };
    
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao atualizar pedido:", error);
            throw error;
        }
    },

    deletarPedido: async (idPedido) => {

        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {

            let querySQL = `
                SELECT idEntrega 
                FROM ENTREGAS 
                WHERE idPedido = @idPedido
            `;

            const resultadoEntrega = await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            const idEntrega = resultadoEntrega.recordset[0].idEntrega;

            querySQL = `
                DELETE FROM ENTREGAS
                WHERE idEntrega = @idEntrega
            `;

            await transaction.request()
                .input("idEntrega", sql.UniqueIdentifier, idEntrega)
                .query(querySQL);

            querySQL = `
                DELETE FROM PEDIDOS
                WHERE idPedido = @idPedido
            `;

            await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

            await transaction.commit();

        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao deletar Pedido:", error);
            throw error;
        }
    },



}
module.exports = {pedidoModels}