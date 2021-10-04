const express = require('express')
const app = express()
const { v4: uuidv4 } = require('uuid')

const custumers = []

app.get('/', (req, res) => res.json({message: 'oi'}))

app.use(express.json())

// Midlleware
function verifyExistAccountCPF( req, res, next ) {
    const {cpf} = req.headers
    const custumer = custumers.find( custumer => custumer.cpf === cpf)

    if(custumer){
        req.custumer = custumers[0]
        next()
    } else {
        // not exist
        return res.status(400).json({error: 'Usuário não cadastrado'})
    }
}

function getBalance(statemnt) {
    const balance = statemnt.reduce( (acc, operation) => {
        if ( operation.type === "credit" ) {
            return acc + operation.amount 
        } else {
            return acc - operation.amount
        }
    }, 0)
    return balance
}

app.post('/account', (req, res) => {
    const { cpf, name }  = req.body
    const id = uuidv4()

    if (!custumers.some( pessoa => pessoa.cpf === cpf)) {

        custumers.push({cpf, name, id, statement: []})
        return res.status(201).send('Pessoa cadastrada')
    } else {
        return res.status(400).send('Pessoa já cadastrada')
    }
})

app.get('/statement', verifyExistAccountCPF, (req, res) => {
    const {custumer} = req
    return res.json(custumer.statement)
})

app.post('/deposit', verifyExistAccountCPF, (req, res) => {
    const { amount, description } = req.body

    const {custumer} = req

    const parsedDeposit = {
        amount,
        description,
        created_at: new Date(),
        type: "credit"
    }

    custumer.statement.push(parsedDeposit)

    return res.status(201).send("Deposito concluido")
})

app.post('/withdraw', verifyExistAccountCPF, (req, res) => {
    const { amount } = req.body
    const {custumer} = req

    const balance = getBalance(custumer.statement)
    
    if (balance < amount) {
        res.status(400).send('saldo insuficiente')
    } else {
        const withDraw = {
            amount,
            created_at: new Date(),
            type: "debit"
        }

        custumer.statement.push(withDraw)

        res.status(201).send(('saque feito'))
    }
})

app.get('/statement/:date', verifyExistAccountCPF, (req, res) => {
    const { custumer } = req
    const { date } = req.query

    const dateFormated = new Date(date + " 00:00")
    const statement = custumer.statement.filter( statement => statement.created_at.toDateString() === new Date(dateFormated).toDateString())

    if ( statement ) {
        return res.status(200).json(statement)
    } else {
        return res.status(400).json({error: 'Nenhuma operação encontrada'})
    }
})

app.put('/account', verifyExistAccountCPF, (req, res) => {
    const {name} = req.body
    const {custumer} = req // só consigo acessar por causa  do middlwware

    custumer.name = name

    console.log(custumer)
    return res.status(200).json({message: 'Nome alterado com sucesso'})
})

app.delete('/account', verifyExistAccountCPF, (req, res) => {
    const { custumer } = req

    custumers.slice(custumer, 1)

    res.status(200).json({message: 'Conta excluida com sucesso'})
    console.log(custumers)
})

app.get('/balance', verifyExistAccountCPF, (req, res) => {
    const { custumer } = req

    const balance = getBalance(custumer.statement)

    return res.status(200).json({balance})
})

app.listen(3000, () => console.log('Rodando em http://localhost:3000'))  