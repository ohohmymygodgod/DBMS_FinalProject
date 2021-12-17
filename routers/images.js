var express = require('express');
var router = express.Router();
var { db_all, db_run, db_get } = require("../database/database.js")
var { verifyUser, verifyToken } = require("../auth/verify.js");
var multer  = require('multer')
var fs = require('fs')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${__dirname}/../images`)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

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

router.post('/', upload.single('file'), async function(req, res){
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(result => {
        handleRes(res, 200, "success", {url: `${req.get('host')}/images/${req.file.originalname}`});
    }).catch(err => {
        handleError(res, err)
    })
})

router.get('/:IMAGE', async function(req, res) {
    res.sendFile(`/Users/cby/iCloud/110-1/DBMS/project/codes/images/${req.params.IMAGE}`);
})


module.exports = router;