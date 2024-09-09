const express = require('express');
const app = express();
const multer = require("multer");
const path= require("path");
const mongoose= require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');



// Middleware to parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose.connect("mongodb+srv://rabbiabatool875:0xxq5tFIGb5ZJaSk@cluster0.dfxy06s.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0")

mongoose.connect(process.env.MONGODB_URI||"mongodb://localhost:27017/e-com").then(()=>{
    console.log("Mongodb connected");
})

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// app.listen(4000, () => {
//     console.log("Server listening on port 4000");
// });


app.post('/create-checkout-session', async (req, res) => {
    
    const { products } = req.body;
    
    
    const lineItems = products.map((e) => {

    
        return {
            price_data: {
                currency: "usd",

                product_data: {
                    name: e.name,
                    image: [e.image], // Image is not a valid field for product_data
                },
                unit_amount: Math.round(e.new_price * 100),
            }, // Convert to cents
            quantity: 1,
        };
    });


    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "http://localhost:4000/all_products",
        cancel_url: "http://localhost:4000/all_products",
    });

    res.json({ id: session.id });
});


const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000000000000
    }
})
app.use('/images', express.static('upload/images'));
app.post("/upload", upload.single('profile'), (req,res) => {

    res.json(
        {
            success: 1,
            profile_url: `http://localhost:4000/images/${req.file.filename}`
        }
    )
})

function errHandler(err, req, res, next){
    if(err instanceof multer.MulterError){
        res.json({
            success: 0,
            message: err.message

        })
    }
}
// schema for creating products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    new_price:{
        type: Number,
        required: true,
    },
    old_price:{
        type: Number,
        required: true,
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,

    }
})
app.post('/add_product',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else
    {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name: req.body.name,
    })
})

const users = mongoose.model('users',{
    name:{
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default:Date.now,
    },

})

// creating end point for registering user
app.post('/signup',async (req,res)=>{

    let check = await users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with email address"})
    }
    let cart = {};
    for(let i=0; i<20; i++){
        cart[i]= 0;
    }
    const user = new users({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();
    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})


})
// creating end point for user login
app.post('/login', async (req,res)=>{
    let user = await users.findOne({email:req.body.email});
    if(user) {
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong email id"})
    }

})
app.post('/ad_login', async (req,res)=>{
    let emails= "samra@gmail.com";
    let pass ="123";
    let user = await users.findOne({email:emails});
    if(user) {
        const passCompare = req.body.password === pass;
        if(passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong email id"})
    }

})


// creating api for deleting products
app.post('/remove_product',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name: req.body.name
    })
        
})

// creating api for getting all products
app.get('/all_products',async (req,res)=> {
    let products = await Product.find({});
    console.log("All products fetched");
    res.send(products);

})
//creating endpoint for new collection data
app.get('/new_collections',async (req,res)=>{

    let products = await Product.find({});
    let new_collection = products.slice(0,9);
    console.log("New collections fetched");
    res.send(new_collection);
})
// creating end point for popular section
app.get('/popular',async (req,res)=>{

    let products = await Product.find({category:"women"});
    let collection = products.slice(-4);
    console.log("New collections fetched");
    res.send(collection);
})
// creating   to fetch user
const fetchUser = async (req,res,next) =>{
    const token = req.header('auth-token');
    if(!token) {
        res.status(401).send({errors:"Please authenticate using valid token"});
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user= data.user;
            next();

        }catch(error){
            
            res.status(401).send({errors:"Please authenticate using valid token"});
        }
    }
}
// creating end point for removing product from cart data
app.post('/removeCart',fetchUser,async (req,res)=>{
    let userData = await users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -=1;
    await users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed");
})

// end point for getting cart 
app.post('/getCart',fetchUser,async(req,res)=>{

    try {
        let userData = await users.findOne({ _id: req.user.id });

        if (!userData || !userData.cartData) {
            alert("login or sign up first");
            return res.json([]);
        }
        
        res.json(userData.cartData);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the cart data.' });
    }
})

// creating end point for cart
app.post('/add_to_cart',fetchUser,async (req,res)=>{
    
    let userData = await users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
})

app.get('/view_order',async (req,res) =>{

    const excludedEmail = 'samra@gmail.com'; // Replace with the actual email to exclude  

    const orders = await users.find({ email: { $ne: excludedEmail } }); // Find all users where email is NOT equal to excludedEmail  

    res.send(orders);  
})

app.post('/remove_order',async (req,res) =>{

    let email= req.body.email;

    await users.findOneAndDelete({email});
    res.send("Deleted successfully");

})





app.use(errHandler);