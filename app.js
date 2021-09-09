const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const flash  =require('connect-flash');
const session = require('express-session');


const app = express();


//mongoose connection logic
mongoose.connect('mongodb://localhost:27017/authDemo',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error:'));
db.once("open", ()=>{
    console.log("Database connected");
});

app.set('view engine', 'ejs')
app.set('views', 'views')

//parsing form data
app.use(express.urlencoded({extended: true}))

//flash and sessions
const sessionConfig = {
    secret: 'iamchallengeman',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60* 24 * 7),
        maxAge: 1000 * 60 * 60* 24 * 7,
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})


//ROUTES
app.get('/', (req, res)=>{
    res.render('home.ejs')
})

app.get('/register', (req, res)=>{
    res.render('register.ejs')
})

app.post('/register', async(req, res)=>{
    const {username, password } = req.body;
    //hash the password
    const hash = await bcrypt.hash(password, 12);

    //create new user and save
    const user = new User({
        username,
        password: hash
    })
    await user.save()
    req.flash('success', 'Successfully registered as a new user.')

    //redirect
    res.redirect('/')

})



app.listen(8000, ()=>{
    console.log('Listening on port 8000')
})