var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "./database/final_project.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message)
        throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text not null,
            type text CHECK( type IN ("買家", "賣家") ) not null,
            password text not null,
            token text,
            email text not null, 
            phone text not null
            )`,(err) => {
                if(err){
                    // console.log(err)
                }
        })
        db.run(`CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text not null,
            description text not null,
            picture text not null,
            inventory integer not null,
            price integer not null,
            startSaleTime text not null,
            endSaleTime text not null,
            userId integer not null,
            FOREIGN KEY(userId) REFERENCES users(id)
            )`,(err) => {
                if(err){
                    // console.log(err)
                }
        })
        db.run(`CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp text not null,
            products text not null,
            buyerId integer not null,
            FOREIGN KEY(buyerId) REFERENCES users(id)
            )`,(err) => {
                if(err){
                    // console.log(err)
                }
        })
    }
});

async function db_all(query, params){
    return new Promise(function(resolve,reject){
        db.all(query, params, function(err,result){
            if(err){
               return reject(err);
            }
           resolve(result);
        });
    });
}

async function db_run(query, params){
    return new Promise(function(resolve,reject){
        db.run(query, params, function(err,result){
            if(err){
                return reject(err);
            }
            const ID = this.lastID;
            resolve({ ID, result });
        });
    });
}

async function db_get(query, params){
    return new Promise(function(resolve,reject){
        db.get(query, params, function(err,result){
            if(err){
                return reject(err);
            }
            resolve(result);
        });
    });
}

module.exports = {
    db_all,
    db_run,
    db_get
}