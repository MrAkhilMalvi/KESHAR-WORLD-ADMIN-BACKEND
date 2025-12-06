const express = require("express");
const productsCtrl = require("../controllers/products");
const router = express.Router();

router.route('/').post(productsCtrl.get_products);  
router.route('/images').post(productsCtrl.get_products_images); 
router.route('/add').post(productsCtrl.add_products);  
router.route('/update').post(productsCtrl.update_products);  
router.route('/delete').post(productsCtrl.delete_products);  
router.route('/images/save').post(productsCtrl.saveProductImage); 
router.route('/images/delete').post(productsCtrl.deleteProductImage); 
// router.route('/delete/thumbnail').post(productsCtrl.delete_products_thumbnail); 
module.exports = router;