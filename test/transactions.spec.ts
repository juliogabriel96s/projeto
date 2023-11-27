import {it, beforeAll, afterAll, describe, expect, beforeEach} from 'vitest'
import request from 'supertest'
import { app } from '../src/app'
import {execSync} from 'node:child_process'

describe('Transactions routes', () =>{

  beforeAll(async () =>{
    await app.ready()
    })
    
    afterAll(async () =>{
        await app.close()
    })

    beforeEach(()=>{
      execSync('npm run knex migrate:rollback --all')
       execSync('npm run knex migrate:latest')
    })
    
    it('Should be able to create a new transaction.', async () =>{
    
     await request(app.server)
       .post('/transactions')
       .send({
        title: 'New transactions',
        amount: 5000,
        type: 'credit'
       })
       .expect(201)
    
    
    })

    it('Should be able to list all transactions', async() =>{
       const createTransactionsResponse =  await request(app.server)
       .post('/transactions')
       .send({
        title: 'New transactions',
        amount: 5000,
        type: 'credit'
       })

       const cookies = createTransactionsResponse.get('Set-Cookie')

const listTransactionsResponse = await request(app.server)
.get('/transactions')
.set('Cookie', cookies)
.expect(200)

expect(listTransactionsResponse.body.transactions).toEqual([
  expect.objectContaining({
    title: 'New transactions',
    amount: 5000,
  })
])

    })


    it('Should be able to get a specific transaction', async() =>{
      const createTransactionsResponse =  await request(app.server)
      .post('/transactions')
      .send({
       title: 'New transactions',
       amount: 5000,
       type: 'credit'
      })

      const cookies = createTransactionsResponse.get('Set-Cookie')

const listTransactionsResponse = await request(app.server)
.get('/transactions')
.set('Cookie', cookies)
.expect(200)

const transactionsId = listTransactionsResponse.body.transactions[0].id

const getTransactionsResponse = await request(app.server)
.get(`/transactions/${transactionsId}`)
.set('Cookie', cookies)
.expect(200)

expect(getTransactionsResponse.body.transactions).toEqual(
 expect.objectContaining({
   title: 'New transactions',
   amount: 5000,
 })
)

   })


   it('Should be able to get the sumary', async() =>{
    const createTransactionsResponse =  await request(app.server)
    .post('/transactions')
    .send({
     title: 'Credit transactions',
     amount: 5000,
     type: 'credit'
    })

    const cookies = createTransactionsResponse.get('Set-Cookie')

await request(app.server)
    .post('/transactions')
    .set('Cookie', cookies)
    .send({
     title: 'Debit transactions',
     amount: 2000,
     type: 'debit'
    })


const sumaryResponse = await request(app.server)
.get('/transactions/sumary')
.set('Cookie', cookies)
.expect(200)

expect(sumaryResponse.body.sumary).toEqual({
  amount: 3000
})

 })
})
