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
    res.locals.dish = req.body.data;
    next();
}

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res) => {
    res.json({ data: dishes });
};

const create = (req, res, next) => {
    const newId = nextId();
    const newDish = {
        id: newId,
        ...res.locals.dish,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// exports
module.exports = {
    list,
    create: [hasValidInput, create],    
}