const express = require("express");
const app = express();
const userRoutes=require("./Routers/Routers");
const cors=require('cors');
// const bodyParser = require('body-parser');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(4000, () => console.log("Server ready on port 4000."));


// app.use('/images', express.static('upload/images'));


app.use(userRoutes);





