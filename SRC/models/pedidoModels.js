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
    inserirPedido: async (idPedido, idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorBaseKM, valorBaseKg) => {



        try {
            const pool = await getConnection();
            let querySQL = `
                INSERT INTO PEDIDOS (idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorBaseKM, valorBaseKg)
                OUTPUT INSERTED.idPedido
                VALUES (@idCliente, @dataPedido, @tipoEntrega, @distanciaKM, @pesoCarga, @valorBaseKM, @valorBaseKg)
            `

            await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntrega", sql.VarChar(7), tipoEntrega )
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)
                .input("pesoCarga", sql.Decimal(10, 2),pesoCarga )
                .input("valorBaseKM", sql.Decimal(10, 2), valorBaseKM)
                .input("valorBaseKg", sql.Decimal(10, 2), valorBaseKg)
                .query(querySQL)



        } catch (error) {
            console.error("Erro ao inserir pedido:", error);
            throw error;
        }
    },
    atualizarPedido: async (idPedido,idCliente,dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorBaseKM, valorBaseKg) => {
        try {
            const pool = await getConnection();
            const querySQL = `
            UPDATE PEDIDOS
            SET dataPedido = @dataPedido,
            idCliente = @idCliente
            tipoEntrega = @tipoEntrega,
            distanciaKM = @distanciaKM,
            pesoCarga = @pesoCarga,
            valorBaseKM = @valorBaseKM,
            valorBaseKg = @valorBaseKg
            WHERE idPedido = @idPedido
            `
            await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntrega", sql.VarChar(7), tipoEntrega )
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)
                .input("pesoCarga", sql.Decimal(10, 2),pesoCarga )
                .input("valorBaseKM", sql.Decimal(10, 2), valorBaseKM)
                .input("valorBaseKg", sql.Decimal(10, 2), valorBaseKg)
                .query(querySQL)

        } catch (error) {
            console.error("Erro ao atualizar pedido:", error);
            throw error;

        }
    },




}
module.exports = {pedidoModels}
