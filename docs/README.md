## API Reference 

### CLIENTES

#### GET /clientes
- **Descrição**: Obtem uma lista de clientes cadastrados
- **Responde**: Arry de clientes

#### POST /clientes
- **Descrição**: Cadastrar um novo cliente
- **Body**:
```
{
	"nomeCliente": "nomeExemplo",
	"cpfCliente": "cpfExemplo",
	"telefoneCliente": "telefoneExemplo",
	"emailCliente": "emailExemplo",
"enderecoCliente": "enderecoExemplo"
}
```

- **Responder**:
```
{
    "message": "Cliente cadastrado com sucesso!"
}
```

#### DELETE /clientes/:idCliente
- **Descrição**: Deletar um cliente cadastrado
- **Responde**:
```
{
    "message": "Cliente deletado com sucesso!"
}
```

#### PUT /clientes/:idCliente
- **Descrição**: Atualizar um cliente cadastrado
- **Body**:
´´´
{
	"nomeCliente": "nomeExemplo",
	"cpfCliente": "cpfExemplo",
	"telefoneCliente": "telefoneExemplo",
	"emailCliente": "emailExemplo",
"enderecoCliente": "enderecoExemplo"
}
´´´
## API Reference 

### PEDIDOS

#### GET /pedidos
- **Descrição**: Obtem uma lista de pedidos solicitados
- **Responde**: Arry de pedidos

#### POST /pedidos
- **Descrição**: Cadastrar um novo pedido e solicitar uma entrega 
- **Body**:
´´´
{
	"idCliente": "idExemplo",
	"dataPedido": 0000-00-00,
	"tipoEntrega": "tipoExemplo",
	"distanciaKM": "distanciaExemplo",
	"pesoCarga": "pesoExemplo",
	"valorBaseKM": 0.00,
	"valorBaseKg": 0.00
}
´´´
 **Responde**:
```
{
    "message": "Pedido solicitado com sucesso!",
	"idPedido": {
		"idPedido": "idExemplo",
		"idEntrega": "idExemplo"
	}
}
```

#### DELETE /pedidos/:idPedido
- **Descrição**: Deletar um pedido solicitado e deletar uma entraga solicitada
- **Responde**:
```
{
    "message": "Pedido e entrega deletado com sucesso!"
}
```

#### PUT /pedidos/:idPedido
- **Descrição**: Atualizar um pedido solicitado e atualizar uma entrega solicitada
- **Body**:
´´´
{
	"idCliente": "idExemplo",
	"dataPedido": 0000-00-00,
	"tipoEntrega": "tipoExemplo",
	"distanciaKM": "distanciaExemplo",
	"pesoCarga": "pesoExemplo",
	"valorBaseKM": 0.00,
	"valorBaseKg": 0.00
	"statusEntrega": "statusExemplo"
}
´´´
 **Responde**:
```
{
    "message": "Pedido atualizado com sucesso!"
}
```

### ENTREGAS

#### GET /entregas
- **Descrição**: Obtem uma lista das entregas solicitadas
- **Responde**: Arry de entregas


