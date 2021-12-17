var express = require('express');
var router = express.Router();
var { db_all, db_run, db_get } = require("../database/database.js")
var { verifyUser, verifyToken } = require("../auth/verify.js");

function handleRes(res, status, message, data) {
    res.json({
        "status": status,
        "message": message,
        "data": data
    })
}

function handleError(res, err) {
    res.json({
        "status": 400,
        "message": err.message
    })
}

router.post("/", async function(req, res) {
    var data = req.body
    var sql ='insert into users (name, type, password, email, phone) values (?,?,?,?,?)';
    var params = [data.name, data.type, data.password, data.email, data.phone];
    await db_run(sql, params)
    .then(async ({ ID, result }) => {
        sql = 'select id, name, type, email, phone from users where id = ?'
        params = [ID]
        await db_get(sql, params)
        .then(async result => {
            handleRes(res, 201, "created", result);
        }).catch(err => {
            handleError(res, err);
        })
    }).catch(err => {
        handleError(res, err);
    })
})

router.patch("/:id", async function(req, res) {
    var data = req.body;
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    const id = req.params.id;
    await verifyToken(id, token)
    .then(async (result) => {
        var sql = 'update users set name = ?, phone = ? where id = ?';
        var params = [data.name, data.phone, id];
        await db_run(sql, params)
        .then(async ({ID, result}) => {
            sql = 'select id, name, type, email, phone from users where id = ?';
            params = [id];
            await db_get(sql, params)
            .then(result => {
                handleRes(res, 200, "success", result);
            }).catch(err => {
                handleError(res, err);
            })
        }).catch(err => {
            handleError(res, err);
        })
    }).catch(err => {
        handleError(res, err);
    })
})

router.post("/signIn", async function(req, res) {
    var data = req.body;
    await verifyUser(data.email, data.password)
    .then(async ({ token, result }) => {
        sql = 'update users set token = ? where id = ?';
        params = [token, result.id];
        await db_run(sql, params)
        .then(({ID, result}) => {
            data = {
                "id": params[1],
                "token": params[0],
            }
            handleRes(res, 200, "ok", data);
        }).catch(err => {
            handleError(res, err);
        })
    }).catch(err => {
        handleError(res, err);
    })
})

router.get("/me", async function(req, res) {
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var sql ='select id, name, type, email, phone from users where token = ?';
        var params = [token];
        await db_get(sql, params)
        .then(result => {
            handleRes(res, 200, "success", result)
        }).catch(err => {
            handleError(res, err);
        })
    }).catch(err => {
        handleError(res, err);
    })
})

router.get("/debug/all", async function(req, res){
    var sql = 'select * from users'
    var params = []
    await db_all(sql, params)
    .then(result => {
        handleRes(res, 200, "success", result)
    }).catch(err => {
        handleError(res, err);
    })
})


module.exports = router;