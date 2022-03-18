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

module.exports = {handleRes, handleError}