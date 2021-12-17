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

router.post("/", async function(req, res){
    var data = req.body;
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var sql ='insert into products (name, description, picture, inventory, price, startSaleTime, endSaleTime, userId) values (?,?,?,?,?,?,?,?)';
        var params = [data.name, data.description, data.picture, data.inventory, data.price, data.startSaleTime, data.endSaleTime, result.id];
        await db_run(sql, params)
        .then(async ({ ID, result }) => {
            sql = 'select id, name, description, picture, inventory, price, startSaleTime, endSaleTime from products where id = ?'
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
    }).catch(err => {
        handleError(res, err);
    })
})

router.get("/", async function(req, res){
    var sql = 'select id, name, description, picture, inventory, price, startSaleTime, endSaleTime from products';
    var params = [];
    await db_all(sql, params)
    .then(result => {
        handleRes(res, 200, "success", result)
    }).catch(err => {
        handleError(res, err);
    })
})

router.get("/:id", async function(req, res){
    var sql = 'select id, name, description, picture, inventory, price, startSaleTime, endSaleTime from products where id = ?';
    var params = [req.params.id];
    await db_get(sql, params)
    .then(result => {
        if(!result){
            return handleError(res, {message: "product not found"});
        }
        handleRes(res, 200, "success", result)
    }).catch(err => {
        handleError(res, err);
    })
})

router.patch("/:id", async function(req, res){
    var data = req.body;
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var userId = result.id
        var sql = 'select * from products where userId = ? and id = ?';
        var params = [userId, req.params.id];
        await db_get(sql, params)
        .then(async (result) => {
            if(!result){
                return handleError(res, {message: "product not found"});
            }
            sql = 'update products set name = ?, description = ?, picture = ?, inventory = ?, startSaleTime = ?, endSaleTime = ? where userId = ? and id = ?';
            params = [data.name, data.description, data.picture, data.inventory, data.startSaleTime, data.endSaleTime, userId, req.params.id];
            await db_run(sql, params)
            .then(async ({ID, result}) => {
                sql = 'select id, name, type, email, phone from users where id = ?';
                params = [userId];
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
    }).catch(err => {
        handleError(res, err);
    })
})

router.delete("/:id", async function(req, res){
    var data = req.body;
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var userId = result.id;
        var sql = 'select * from products where userId = ? and id = ?';
        var params = [userId, req.params.id];
        await db_get(sql, params)
        .then(async (result) => {
            if(!result){
                return handleError(res, {message: "product not found"});
            }
            var name = result.name;
            sql = 'delete from products where userId = ? and id = ?';
            params = [userId, req.params.id];
            await db_run(sql, params)
            .then(async ({ID, result}) => {
                handleRes(res, 200, "success", name);
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

router.get("/debug/all", async function(req, res){
    var sql = 'select * from products'
    var params = []
    let result = await db_all(sql, params)
    .then(result => {
        handleRes(res, 200, "success", result)
    }).catch(err => {
        handleError(res, err);
    })
})

module.exports = router;
