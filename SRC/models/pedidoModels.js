const {sql, getConnection} = require("../config/db")

    /**
     * Busca todos os pedidos e seus repectivos itens no Banco de Dados.
     * 
     * @async
     *
     *  @function buscarTodos 
     * @returns {Promise<Array>} Retorna uma lista com todos os pedidos e tipos de entregas.
     * 
     * @function buscarUm
     * @returns {Promise<Array>} Retorna uma lista com um os pedido seu respctivo tipo de entrega.
     *
     * @function criarPedido
     * @returns {Promise<Array>} Cria um pedido com os dados (idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorBaseKM,valorBaseKg, valorDistancia, valorPeso, acreEntrega, descEntrega, taxaEntrega, valorFinal,
        statusEntrega)
     * 
        @function buscarPorCliente
     * @returns {Promise<Array>} semelhante a um buscar Um busca um cliente ja cadastrado pelo seus dados.
     * 
     * @function atualizarPedido
     * @returns {Promise<Array>} Atualiza os pedidos e todos suas informações.
     * 
     * @function deletarPedido
     * @returns {Promise<Array>} Deleta/Cancela o pedido e suas infomações.
     * @throws Mostra no console o erro e propaga o erro caso a busca falha.
     */

const pedidoModels = {
     // Buscar todos os pedidos atravez do metodo GET 
    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            const querySQL = `
            SELECT*
            FROM PEDIDOS
            
            `

            const result = await pool.request()
                .query(querySQL);

                return result.recordset

        } catch (error) { //converte o erro para controller tratar
            console.error("Erro ao buscar pedido", error);
            throw error;
        }
    },

    //Busca um pedido pelo ID(36 digitos) caso ele exista 
    buscarUm: async (idPedido) => {
        try {
            const pool = await getConnection();

            const querySQL = "SELECT* FROM PEDIDOS WHERE idPedido = @idPedido";

            const result = await pool.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .query(querySQL);

                return result.recordset;
        } catch (error) { // converte o erro para o controller tratar
            console.error("Erro ao buscar o pedido", error);
            throw error;
        }
    },

     //meto GET semelhante ao buscarUm busca 1 cliente ja cadastrado
    buscarPorCliente: async (idCliente) => {
        const pool = await getConnection();
    
        const query = `
            SELECT *
            FROM PEDIDOS
            WHERE idCliente = @idCliente
        `;
    
        const result = await pool.request()
            .input('idCliente', sql.UniqueIdentifier, idCliente)
            .query(query);
    
        return result.recordset;
    },

     // criar um pedido pelo metodo POST atravez desses dados se relacionando com Entrega
    criarPedido: async (idCliente, dataPedido, tipoEntrega, distanciaKM, pesoCarga, valorBaseKM,valorBaseKg, valorDistancia, valorPeso, acreEntrega, descEntrega, taxaEntrega, valorFinal,
    statusEntrega
    ) => {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
    
        await transaction.begin();
    
        try {
    
            
            
            const querySQL = `
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

            // Dados SQL de cada elemento
            const resultPedido = await transaction.request()
                .input("idCliente", sql.UniqueIdentifier, idCliente)
                .input("dataPedido", sql.Date, dataPedido)
                .input("tipoEntrega", sql.VarChar(7), tipoEntrega)
                .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)
                .input("pesoCarga", sql.Decimal(10, 2), pesoCarga)
                .input("valorBaseKM", sql.Decimal(10, 2), valorBaseKM)
                .input("valorBaseKg", sql.Decimal(10, 2), valorBaseKg)
                .query(querySQL);
    
            const idPedido = resultPedido.recordset[0].idPedido;
    
    
            
            const querySQLe = `
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
    
            // dados SQL da entrega ligado ao pedido
            const resultEntrega = await transaction.request()
                .input("idPedido", sql.UniqueIdentifier, idPedido)
                .input("valorDistancia", sql.Decimal(10, 2), valorDistancia)
                .input("valorPeso", sql.Decimal(10, 2), valorPeso)
                .input("acreEntrega", sql.Decimal(10, 2), acreEntrega)
                .input("descEntrega", sql.Decimal(10, 2), descEntrega)
                .input("taxaEntrega", sql.Decimal(10, 2), taxaEntrega)
                .input("valorFinal", sql.Decimal(10, 2), valorFinal)
                .input("statusEntrega", sql.VarChar(11), statusEntrega)
                .query(querySQLe);
    
            await transaction.commit();
    
            return {
                idPedido, //retorna o ID do pedido relacionado com o idEntrega
                idEntrega: resultEntrega.recordset[0].idEntrega
            };
    
        } catch (error) {
            await transaction.rollback();
            console.error("Erro ao inserir pedido", error);
            throw error;
        }
    },

    //Atualiza o pedido pelo metodo PUT casso exista 
    atualizarPedido: async (
        idPedido,
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
        try {
            const pool = await getConnection();
    
            // Atualiza PEDIDOS
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
            await pool.request()
            .input("idPedido", sql.UniqueIdentifier, idPedido)
            .input("idCliente", sql.UniqueIdentifier, idCliente)
            .input("dataPedido", sql.Date, dataPedido)
            .input("tipoEntrega", sql.VarChar(7), tipoEntrega)
            .input("distanciaKM", sql.Decimal(10, 2), distanciaKM)
            .input("pesoCarga", sql.Decimal(10, 2), pesoCarga ?? pedidoAtual.pesoCarga)
            .input("valorBaseKM", sql.Decimal(10, 2), valorBaseKM)
            .input("valorBaseKg", sql.Decimal(10, 2), valorBaseKg)
            .query(queryPedido); // Executa a query de atualização do pedido
    
            // Atualiza ENTREGAS
            const queryEntrega = `
                UPDATE ENTREGAS
                SET
                   UPDATE ENTREGAS
                SET
                    valorDistancia = @valorDistancia,
                    valorPeso = @valorPeso,
                    acreEntrega = @acreEntrega,
                    descEntrega = @descEntrega,
                    taxaEntrega = @taxaEntrega,
                    valorFinal = @valorFinal,
                    statusEntrega = @statusEntrega
                WHERE idPedido = @idPedido;
            `;
            await pool.request()
            .input("idPedido", sql.UniqueIdentifier, idPedido)
            .input("valorDistancia", sql.Decimal(10, 2), valorDistancia)
            .input("valorPeso", sql.Decimal(10, 2), valorPeso)
            .input("acreEntrega", sql.Decimal(10, 2), acreEntrega)
            .input("descEntrega", sql.Decimal(10, 2), descEntrega)
            .input("taxaEntrega", sql.Decimal(10, 2), taxaEntrega)
            .input("valorFinal", sql.Decimal(10, 2), valorFinal)
            .input("statusEntrega", sql.VarChar(11), statusEntrega)
            .query(queryEntrega); // Executa a query de atualização da entrega

    
        } catch (error) {
            console.error("Erro ao atualizar pedido", error);
            throw error;
        }
    },

    // Deleta um pedido e sua entrega correspondente
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
    }



}
module.exports = {pedidoModels} // Exporta o models