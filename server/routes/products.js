const express = require("express");
const productsCtrl = require("../controllers/products");
const router = express.Router();

router.route('/').get(productsCtrl.get_products);  
router.route('/add').post(productsCtrl.add_products);  
router.route('/update').post(productsCtrl.update_products);  
router.route('/delete').post(productsCtrl.delete_products);  

module.exports = router;