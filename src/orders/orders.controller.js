const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// middleware functions
function isValidOrder(req, res, next) {
    const orderId = req.params.orderId;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        res.locals.orderId = orderId;
        next();
    }
    next({
        status: 404,
        message: `Order does not exist: ${orderId}`
    });
}

// "/orders" handlers
const list = (req, res) => {
    res.json({ data: orders });
}

// "/orders/:orderId" handlers
const read = (req, res) => {
    res.json({ data: res.locals.order });
}

module.exports = {
    list,
    read: [isValidOrder, read]
}
