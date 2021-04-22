const express = require('express')
const dotenv = require ('dotenv')
const connectDB = require('./config/db')
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session);
const morgan = require('morgan');

//load config
dotenv.config({path: './config/config.env'})

//passport config 
require('./config/passport')(passport)



connectDB()
const app = express()
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true
}));

//express-session middleware
app.use(session({
    secret: 'lalala meow',
    resave: false,
    saveUninitialized:false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//body parser
app.use(express.json()) 
app.use(express.urlencoded({extended: true}))

//passport middleware 
app.use(passport.initialize());
app.use(passport.session());

//Routes 
app.use('/auth',require('./routes/auth'));
// app.use('/user', require('./routes/users'));



app.use('/', express.static('client/build'))
app.use('/:path', express.static('client/build'))

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}
const PORT = process.env.PORT || 8000
app.listen(PORT, console.log(`Server running in${process.env.NODE_ENV} mode on port ${PORT}`))