const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const cookieParser = require("cookie-parser");
app.use(cookieParser());

//setting up dotenv
const dotenv = require('dotenv');
// get config vars
dotenv.config();
const port = process.env.PORT;

app.use(express.urlencoded());
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('assets'));

app.use(expressLayouts);
//extract layout and scripts from sub pages to layout
app.set('layout extractStyles' , true);
app.set('layout extractScripts' , true);

//set up the view engine
app.set('view engine' , 'ejs');
app.set('views' , './views');

//use express router
app.use('/' , require('./routes'));

//use cookie parser
app.use(cookieParser());

app.listen(port , function(err){
    if(err){
        console.log(`Error on running the server : ${err}`);
        return;
    }

    console.log(`Server is successfully running at port : ${port}`);
});