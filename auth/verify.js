const SECRET="JWT_SECRET"
var { db_all, db_run, db_get } = require("../database/database.js")
const jwt = require('jsonwebtoken')


async function verifyUser(email, password) {
    var sql ='select id, email from users where email = ? AND password = ?';
    var params = [email, password];
    return new Promise(async function(resolve,reject){
        await db_get(sql, params)
        .then(result => {
            if(result){
                const token = jwt.sign(result, SECRET, {});
                resolve({ token, result })
            }else{
                reject({message: "user not found"})
            }
        }).catch(err => {
            reject(err);
        })
    })
    
}

async function verifyToken(id, token){
    const decoded = jwt.verify(token, SECRET);
    var sql ='select id, name, type, email, phone from users where id = ? AND token = ?';
    var params = [decoded.id, token];
    return new Promise(async function(resolve,reject){
        if (id != params[0] && id != -1){
            return reject({message: "token wrong"})
        }
        await db_get(sql, params)
        .then(result => {
            if(result){
                resolve(result);
            }else{
                reject({message: "user not found"});
            }
        }).catch(err => {
            reject(err);
        })
    })
}


module.exports = {
    verifyUser,
    verifyToken
};