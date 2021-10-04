const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// middleware functions

function hasValidInput(req, res, next) {
    const { data = {} } = req.body;
    const VALID_FIELDS = ["name", "description", "price", "image_url"]
    for (let field of VALID_FIELDS) {
        if (!data[field]) {
            next({
                status: 400,
                message: `Dish must include a ${field}`
            });
        }
    }
    if (data.price < 0 || typeof data.price !== "number") {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0
            `,
        });
    }
    res.locals.newDish = data;
    next();
}

function isValidDish(req, res, next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
        res.locals.dishId = dishId;
        next();
    }
    next({
        status: 404,
        message: `Dish does not exist: ${dishId}`
    });
}

function isIdMatch(req, res, next) {
    const { data = {} } = req.body;
    const { id } = data;
    if (!id) {
        next();
    } else if (id !== res.locals.dishId) {
        next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${res.locals.dishId}`
        })
    }
    next();
}

// "/dishes" handlers
const list = (req, res) => {
    res.json({ data: dishes });
};

const create = (req, res, next) => {
    const newId = nextId();
    const newDish = {
        id: newId,
        ...res.locals.newDish,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// "/dishes/:dishId" handlers
const read = (req, res) => {
    res.json({ data: res.locals.dish });
}

const update = (req, res) => {
    const updatedDish = {
        ...res.locals.newDish,
        id: res.locals.dishId
    }
    const index = dishes.findIndex((dish) => dish.id === res.locals.dishId);
    dishes[index] = updatedDish;
    res.json({data: updatedDish})
}

// exports
module.exports = {
    list,
    create: [hasValidInput, create],
    read: [isValidDish, read],
    update: [isValidDish, hasValidInput, isIdMatch, update],
}