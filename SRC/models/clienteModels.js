const {sql, getConnection } = require("../config/db");

const clienteModels = {
    buscarTodos: async () => {
        try {
            const pool = await getConnection();

            let sql = 'SELECT * FROM CLIENTES'           

            const result = await pool.request().query(sql);

            return result.recordset;
            
        } catch (error) {
            console.error(`Erro ao buscar os Clientes`, error);
            throw error;
        }
    },

    buscarUm: async (idCliente) =>{
        try {
            const pool = await getConnection();

            const querySQL = 'SELECT* FROM CLIENTES WHERE idCliente = @idCliente';

            const result = await pool
                .request()
                .input('idCliente', sql.UniqueIdentifier, idCliente)
                .query(querySQL);

                return result.recordset;
        } catch (error) {
            console.error(`Erro ao buscar cliente`, error);
            throw error;
        }

},

buscarCpf: async (cpfCliente) => {
    try {
        const pool = await getConnection();

        const querySQL = 'SELECT * FROM Clientes WHERE cpfCliente = @cpfCliente;';

        const result = await pool.request()
        .input ('cpfCliente', sql.Char(12), cpfCliente)
        .query(querySQL);

        return result.recordset;

    } catch (error) {
        console.error('Erro ao verificar o CPF', error);
        res.status(500).json({erro:'Erro no servidor ao verificar o CPF!'});
    }
},
inserirCliente: async (nomeCliente, cpfCliente, telefoneCliente, emailCliente, enderecoCliente)=>{
    try {

        const pool = await getConnection();

        let querySQL = 'INSERT INTO Clientes(nomeCliente, cpfCliente, telefoneCliente, emailCliente, enderecoCliente) VALUES(@nomeCliente, @cpfCliente, @telefoneCliente, @emailCliente, @enderecoCliente)'

        await pool.request()
        .input('nomeCliente', sql.VarChar(100), nomeCliente)
        .input('cpfCliente', sql.Char(11),cpfCliente)
        .input('telefoneCliente', sql.VarChar(12), telefoneCliente)
        .input('emailCliente', sql.VarChar(50), emailCliente)
        .input('enderecoCliente', sql.VarChar(250), enderecoCliente)
        .query(querySQL);

        
    } catch (error) {
        console.error('Erro ao inserir o cliente', error);
        throw error; // Passa o erro para o controler tratar
    }
},

deletarCliente: async (idCliente) => {
    try {
        const pool = await getConnection();

        const querySQL = 'DELETE FROM CLIENTES WHERE idCliente = @idCliente'

        await pool.request()
        .input('idCliente', sql.UniqueIdentifier, idCliente)
        .query(querySQL);
    } catch (error) {
        console.error(`Erro ao deletar o cliente`, error);
        throw error;
    }
},
atualizarCliente: async (idCliente, nomeCliente, telefoneCliente, emailCliente, enderecoCliente) => {
    try {
        const pool = await getConnection();

        const querySQL= `
            UPDATE CLIENTES
            SET nomeCliente = @nomeCliente,
            telefoneCliente = @telefoneCliente,
            emailCliente = @emailCliente,
            enderecoCliente = @enderecoCliente
        WHERE  idCliente = @idCliente    
        `
        await pool.request()
            .input('idCliente', sql.UniqueIdentifier, idCliente)
            .input('nomeCliente', sql.VarChar(100), nomeCliente)
            .input('telefoneCliente', sql.VarChar(12), telefoneCliente)
            .input('emailCliente', sql.VarChar(50), emailCliente)
            .input('enderecoCliente', sql.VarChar(250), enderecoCliente)
            .query(querySQL);
        
    } catch (error) {
        console.error(`Erro ao atualizar o cliente`, error);
        throw error;
        
    }
}


}
module.exports = {clienteModels};