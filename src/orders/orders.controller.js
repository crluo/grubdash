const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// middleware functions
function hasValidInput(req, res, next) {
    const { data = {} } = req.body;
    const { dishes } = data;
    const VALID_FIELDS = ["deliverTo", "mobileNumber", "dishes"]
    for (let field of VALID_FIELDS) {
        if (!data[field]) {
            next({
                status: 400,
                message: `Order must include a ${field}`,
            });
        }
    }
    if (!Array.isArray(dishes) || dishes.length == 0) {
        next({
            status: 400,
            message: `Order must include at least one dish`,
        });
    }

    for ( const [index, dish] of dishes.entries() ) {
        if (!dish.quantity || dish.quantity <= 0 || typeof dish.quantity !== "number") {
            next({
                status: 400,
                message: `Dish ${index} must have a quantity that is an integer greater than 0`,
            })
        }
    }
    res.locals.newOrder = data;
    next();
}

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

function isOrderStatusValid(req, res, next) {
    if (res.locals.newOrder.status !== "pending") {
        next({
            status: 400,
            message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
        })
    } else if (res.locals.newOrder.status === "delivered") {
        next({
            status: 400,
            message: `A delivered order cannot be changed`
        })
    }
    next();
}

function isDeleteStatusValid(req, res, next) {
    if (res.locals.order.status !== "pending") {
        next({
            status: 400,
            message: `An order cannot be deleted unless it is pending`
        })
    }
    next();
}

function isOrderIdMatch(req, res, next) {
    const { data = {} } = req.body;
    const { id } = data;
    if (!id) {
        next();
    } else if (id !== res.locals.orderId) {
        next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${res.locals.orderId}.`
        })
    }
    next();
}

// "/orders" handlers
const list = (req, res) => {
    res.json({ data: orders });
}

const create = (req, res) => {
    const newId = nextId();
    const newOrder = {
        id: newId,
        ...res.locals.newOrder,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

// "/orders/:orderId" handlers
const read = (req, res) => {
    res.json({ data: res.locals.order });
}

const update = (req, res) => {
    const index = orders.findIndex((order) => order.id === res.locals.orderId);
    const updatedOrder = {
        ...res.locals.newOrder,
        id: res.locals.orderId
    }
    Object.assign(res.locals.order, updatedOrder);
    res.json({data: updatedOrder});
}

const destroy = (req, res) => {
    const index = orders.findIndex((order) => order.id === res.locals.orderId);
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
}

//exports
module.exports = {
    list,
    create: [hasValidInput, create],
    read: [isValidOrder, read],
    update: [isValidOrder, hasValidInput, isOrderIdMatch, isOrderStatusValid, update],
    destroy: [isValidOrder, isDeleteStatusValid, destroy],
}
