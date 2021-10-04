const express = require('express')
const app = express()
const { v4: uuidv4 } = require('uuid')

const costumers = []

app.get('/', (req, res) => res.json({message: 'oi'}))

app.use(express.json())

// Midlleware
function verifyExistAccountCPF( req, res, next ) {
    const {cpf} = req.headers
    const costumer = costumers.find( costumer => costumer.cpf === cpf)

    if(costumer){
        req.costumer = costumers[0]
        next()
    } else {
        // not exist
        return res.status(400).json({error: 'Usuário não cadastrado'})
    }
}

app.post('/account', (req, res) => {
    const { cpf, name }  = req.body
    const id = uuidv4()

    if (!costumers.some( pessoa => pessoa.cpf === cpf)) {

        costumers.push({cpf, name, id, statement: []})
        return res.status(201).send('Pessoa cadastrada')
    } else {
        return res.status(400).send('Pessoa já cadastrada')
    }
})

app.get('/statement', verifyExistAccountCPF, (req, res) => {
    const {costumer} = req
    return res.json(costumer.statement)
})

app.post('/deposit', verifyExistAccountCPF, (req, res) => {
    const { amount, description } = req.body

    const {costumer} = req

    const parsedDeposit = {
        amount,
        description,
        created_at: new Date(),
        type: "credit"
    }

    costumer.statement.push(parsedDeposit)

    return res.status(200).send("Deposito concluido")
})

app.listen(3000, () => console.log('Rodando em http://localhost:3000'))  