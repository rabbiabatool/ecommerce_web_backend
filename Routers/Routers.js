const router=require("express").Router();
const multer = require('multer');
const path = require('path');

const { createCheckout,Signup, login, AddProduct, addlogin, removeProducts, allproducts, newCollect, Popular, removeCart, getCart, addtoCart, viewOrder, removeOrder } =require("../Controller/Controller");


router.post('/create-checkout-session',createCheckout);



const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }
});

// Upload route without any prefix
router.post('/upload', upload.single('profile'), (req, res) => {
    
        res.json({
            success: 1,
            profile_url: `http://localhost:4000/images/${req.file.filename}`
        });
    
});

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