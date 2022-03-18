var express = require('express');
var router = express.Router();
var { db_all, db_run, db_get } = require("../database/database.js")
var { verifyUser, verifyToken } = require("../auth/verify.js");
var {handleRes, handleError } = require("./handler.js");

router.post("/", async function(req, res){
    var data = req.body;
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var error = false;
        var sql = '', params = [];
        for(var i = 0; i < data.length; i++){
            sql = 'select name, description, picture, price from products where id = ?'
            params = [data[i].productId];
            await db_get(sql, params)
            .then(async (result) => {
                if(!result){
                    error = true;
                }
            }).catch(err => {
                handleError(res, err);
            })
            if(error){
                break;
            }
        }
        if(error){
            return handleError(res, {message: "product not found"});
        }
        var sql = 'insert into orders (buyerId, timestamp, products) values (?,?,?)';
        var params = [result.id, new Date().toISOString().slice(0, 10), JSON.stringify(data)]
        await db_run(sql, params)
        .then(async ({ID, result}) => {
            sql = 'select orders.id, users.name, users.email, users.phone, orders.timestamp, orders.products from orders join users where orders.id = ?';
            params = [ID]
            await db_get(sql, params)
            .then(async (result) => {
                data = {
                    id: result.id,
                    buyerName: result.name,
                    buyerEmail: result.email,
                    buyerPhone: result.phone,
                    timestamp: result.timestamp,
                    products: JSON.parse(result.products)
                }
                for(var i = 0; i < data.products.length; i++) {
                    sql = 'select name, description, picture, price from products where id = ?'
                    params = [data.products[i].productId]
                    await db_get(sql, params)
                    .then(result => {
                        data.products[i] = {
                            name: result.name,
                            description: result.description,
                            picture: result.picture,
                            price: result.price,
                            amount: data.products[i].amount
                        }
                    }).catch(err => {
                        handleError(res, err);
                    })
                }
                handleRes(res, 201, "created", data);
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
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var sql = 'select orders.id, users.name, users.email, users.phone, orders.timestamp, orders.products from orders join users where users.id = ?';
        var params = [result.id];
        await db_all(sql, params)
        .then(async (result) => {
            var data = result;
            if(!result){
                return handleRes(res, 200, "success", data);
            }
            for(var i = 0; i < result.length; i++){
                data[i] = {
                    id: data[i].id,
                    buyerName: data[i].name,
                    buyerEmail: data[i].email,
                    buyerPhone: data[i].phone,
                    timestamp: data[i].timestamp,
                    products: JSON.parse(data[i].products)
                }
                var error = false;
                for(var j = 0; j < data[i].products.length; j++){
                    sql = 'select name, description, picture, price from products where id = ?'
                    params = [data[i].products[j].productId];
                    await db_get(sql, params)
                    .then(result => {
                        data[i].products[j] = {
                            name: result.name,
                            description: result.description,
                            picture: result.picture,
                            price: result.price,
                            amount: data[i].products[j].amount
                        }
                    }).catch(err => {
                        error = true
                        return handleError(res, err);
                    })
                }
            }
            if(!error){
                handleRes(res, 200, "success", data);
            }
        }).catch(err => {
            handleError(res, err);
        })
    }).catch(err => {
        return handleError(res, err);
    })
})

router.get("/:id", async function(req, res){
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(async (result) => {
        var sql = 'select orders.id, users.name, users.email, users.phone, orders.timestamp, orders.products from orders join users where orders.id = ?';
        var params = [req.params.id];
        await db_get(sql, params)
        .then(async (result) => {
            if(!result){
                return handleError(res, {message: "order not found"});
            }
            data = {
                id: result.id,
                buyerName: result.name,
                buyerEmail: result.email,
                buyerPhone: result.phone,
                timestamp: result.timestamp,
                products: JSON.parse(result.products)
            }
            var error = false
            for(var i = 0; i < data.products.length; i++) {
                sql = 'select name, description, picture, price from products where id = ?'
                params = [data.products[i].productId]
                await db_get(sql, params)
                .then(result => {
                    data.products[i] = {
                        name: result.name,
                        description: result.description,
                        picture: result.picture,
                        price: result.price,
                        amount: data.products[i].amount
                    }
                }).catch(err => {
                    error = true
                    return handleError(res, err);
                })
            }
            if(!error){
                handleRes(res, 200, "success", data);
            }
        }).catch(err => {
            handleError(res, err);
        })
    }).catch(err => {
        handleError(res, err);
    })
})

module.exports = router;

