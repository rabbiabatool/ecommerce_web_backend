const router=require("express").Router();
const { createCheckout, Upload, Signup, login, AddProduct, addlogin, removeProducts, allproducts, newCollect, Popular, removeCart, getCart, addtoCart, viewOrder, removeOrder } =require("../Controller/Controller");

router.post('/create-checkout-session',createCheckout);
router.post('/upload',Upload);
router.post('/signup',Signup);
router.post('/login',login);
router.post('/add_product',AddProduct);
router.post('/ad_login',addlogin);
router.post('/remove_product',removeProducts);
router.get('/all_products',allproducts);
router.get('/new_collections',newCollect);
router.get('/popular',Popular);
router.post('/removeCart',removeCart);
router.post('/getCart',getCart);
router.post('/add_to_cart',addtoCart);
router.get('/view_order',viewOrder);
router.post('/remove_order',removeOrder);







module.exports=router;