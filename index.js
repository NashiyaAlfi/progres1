const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const app = express()
const jwt = require('jsonwebtoken')
const secretKey = 'this is very secret Key'
const port = 2700;


const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: "corona"
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const Authorized = (request, result, next) => {
    if (typeof(request.headers['x-api-key']) == 'undifined'){
    return result.status(403).json({
        success: false,
        message:'Unauthorized. Token is not provided'
    })
}

let token = request.headers['x-api-key']

jwt.verify(token, secretKey, (err, decoded) => {
    if (err){
        return result.status(401).json({
            success:false,
            message:'Unauthorized. Token is invalid'
        })
    }
})

next()
}

/* list end point */
app.get('/',(request,result) => {
    result.json({
        success:true,
        message:'Welcome'
    })
})

/* Login untuk mendapatkan token */

app.post('/login', (request,result)=>{
    let data = request.body

    if(data.username == 'admin'&&data.password == 'admin'){
        let token = jwt.sign(data.username+'|'+data.password,secretKey)

        result.json({
            success:true,
            message:'Login success, welcome back Admin',
            token:token 
        })
    }
    result.json({
        success:false,
        message:'you are not person with username admin and have password admin!'
    })
})

/* CRUD Users */

app.get('/pengguna', Authorized,(req, res) => {
    let sql = `
        select username, created_at from pengguna 
    `
    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "pengguna, masuk sukses!!",
            data: result 
        })
    })
})

app.post('/pengguna', Authorized, (req, res) => {
    let data = req.body

    let sql = `
        insert into pengguna (username, password)
        values ('`+data.username+`','`+data.password+`')
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "pengguna, sukses!!",
            data: result
        })
    })
})

app.get('/pengguna/:id', Authorized,(req, res)=> {
    let sql = `
        select * from pengguna
        where id = `+req.params.id+`
        limit 1
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json ({
            message: "pengguna, sukses!!",
            data: result[0]
        })
    })
})

app.put('/pengguna/:id', Authorized,(req, res) => {
    let data = req.body

    let sql = `
        update pengguna
        set username = '`+data.username+`', password = '`+data.password+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "pengguna, update sukses",
            data: result
        })
    })
})

app.delete('/pengguna/:id', Authorized,(req, res) => {
    let sql = `
        delete from pengguna
        where id = '`+req.params.id+`'
    `

    db.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "pengguna, delete sukses!!",
            data: result
        })
    })
})

/* Run Application */
app.listen(port, () => {
    console.log('app running on port ' + port)
})
