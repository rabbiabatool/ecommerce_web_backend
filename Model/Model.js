const mongoose=require("mongoose");


mongoose.connect("mongodb://localhost:27017/e-com").then(()=>{
    console.log("Mongodb connected");
})

const productScheme = new mongoose.Schema({
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
            type: String,
            required: true,
        },
        old_price:{
            type: String,
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
});

const userSchema= new mongoose.Schema({ 
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
    
});

const products = mongoose.model("products", productScheme);
const users = mongoose.model("users", userSchema);

module.exports = { products, users };