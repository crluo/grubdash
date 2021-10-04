const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");

// TODO: Implement the /orders routes needed to make the tests pass
router
    .route("/:orderId")
    // .get()
    // .put()
    // .delete()
    .all(methodNotAllowed);

router
    .route("/")
    // .get()
    // .post()
    .all(methodNotAllowed);

module.exports = router;
