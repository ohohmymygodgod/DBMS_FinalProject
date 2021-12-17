var express = require('express');
var app = express();

var usersRouter = require('./routers/users');
var productsRouter = require('./routers/products');
var ordersRouter = require('./routers/orders');
var imagesRouter = require('./routers/images');

app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/images', imagesRouter);

app.listen(3000, function () {
  console.log('mySqlLite listening on port 3000!');
});