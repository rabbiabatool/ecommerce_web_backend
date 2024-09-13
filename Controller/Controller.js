const {users}=require("../Model/Model");
const {products}=require("../Model/Model");

// const multer = require("multer");
// const path= require("path");
// const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')( "sk_test_51Phy2JAfxtUK8Ufa8ePivAyNIfRalMRJZDOLN8mCHHICS73VUhL8iWd6BPwjaRphPue6fUeTUW7G6gttEtYYYwJz00tEgfDF8X");

// const app=require("../index");



// // Middleware to parse incoming request bodies
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));




module.exports.createCheckout=async (req, res) => {
    
    const { products } = req.body;
    
    
    const lineItems = products.map((e) => {

    
        return {
            price_data: {
                currency: "usd",

                product_data: {
                    name: e.name,
                    image: [e.image], // Image is not a valid field for product_data
                },
                unit_amount: Math.round(Number(e.new_price) * 100),
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
};




module.exports.AddProduct=async (req,res)=>{
        let product = await products.find({});
         let new_product=req.body;
        let id;
        if(product.length>0)
        {
            let last_product_array = product.slice(-1);
            let last_product = last_product_array[0];
            id = last_product.id + 1;
        }
        else
        {
            id = 1;
        }
        const Product = new products({
            id: id,
            name: new_product.name,
            image: new_product.image,
            category: new_product.category,
            new_price: new_product.new_price,
            old_price: new_product.old_price
        });
        console.log("product",product);
        await Product.save();
        console.log("Saved");
        res.json({
            success:true,
            name: req.body.name,
        })
 }


    // creating end point for registering user
module.exports.Signup=async (req,res)=>{

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


}
// creating end point for user login
module.exports.login=async (req,res)=>{
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

}

module.exports.addlogin=async (req,res)=>{
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

}


// creating api for deleting products
module.exports.removeProducts=async (req,res)=>{
    await products.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name: req.body.name
    })
        
}

// creating api for getting all products
module.exports.allproducts=async (req,res)=> {
    let product = await products.find({});
    console.log("All products fetched");
    res.send(product);

}
//creating endpoint for new collection data
module.exports.newCollect=async (req,res)=>{

    let product = await products.find({});
    let new_collection = product.slice(0,9);
    console.log("New collections fetched");
    res.send(new_collection);
}
// creating end point for popular section
module.exports.Popular=async (req,res)=>{

    let product = await products.find({category:"women"});
    let collection = product.slice(-4);
    console.log("New collections fetched");
    res.send(collection);
}
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
module.exports.removeCart=fetchUser,async (req,res)=>{
    let userData = await users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -=1;
    await users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed");
}

// end point for getting cart 
module.exports.getCart=fetchUser,async(req,res)=>{

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
}

// creating end point for cart
module.exports.addtoCart=fetchUser,async (req,res)=>{
    
    let userData = await users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] +=1;
    await users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added");
}

module.exports.viewOrder=async (req,res) =>{

    const excludedEmail = 'samra@gmail.com'; // Replace with the actual email to exclude  

    const orders = await users.find({ email: { $ne: excludedEmail } }); // Find all users where email is NOT equal to excludedEmail  

    res.send(orders);  
}

module.exports.removeOrder=async (req,res) =>{

    let email= req.body.email;

    await users.findOneAndDelete({email});
    res.send("Deleted successfully");

}
