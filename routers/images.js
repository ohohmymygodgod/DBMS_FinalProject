var express = require('express');
var router = express.Router();
var { db_all, db_run, db_get } = require("../database/database.js");
var { verifyUser, verifyToken } = require("../auth/verify.js");
var {handleRes, handleError } = require("./handler.js");
var multer  = require('multer')
var fs = require('fs');
const { lstat } = require('fs/promises');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `${__dirname}/../images`)
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })



router.post('/', upload.single('file'), async function(req, res){
    if(!req.header('Authorization')){
        return handleError(res, {message: "token required"});
    }
    const token = req.header('Authorization').replace('Bearer ', '');
    await verifyToken(-1, token)
    .then(result => {
        handleRes(res, 200, "success", {url: `${req.get('host')}/api/images/${req.file.originalname}`});
    }).catch(err => {
        handleError(res, err)
    })
})

router.get('/:IMAGE', async function(req, res) {
    var image = __dirname.split('/');
    image.pop();
    image.push("images")
    image.push(`${req.params.IMAGE}`)
    image = image.join('/');
    res.sendFile(image);
})


module.exports = router;