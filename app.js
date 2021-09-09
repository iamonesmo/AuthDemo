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
        expires: Date.now() + (1000 * 60 * 60),
        maxAge: 1000 * 60 * 60
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

app.get('/login', (req, res)=>{
    res.render('login.ejs')
})

app.get('/logout',(req, res)=>{
    
    res.render('logout.ejs')
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
    req.session.user_id = user._id;
    req.flash('success', 'Successfully registered as a new user.')

    //redirect
    res.redirect('/')

})

app.post('/login', async(req, res)=>{
    const { username, password } = req.body;

    //bcrypt comparison logic
    const user = await User.findOne({ username: username})
    const validPassword = await bcrypt.compare(password, user.password)

    if(validPassword){
        req.session.user_id = user._id;
        res.redirect('/secret')
    } else{
        res.redirect('/login')
    }
})


app.post('/logout',(req, res)=>{
    //req.session.destroy() for destroying a user's entire session
    //usually done when there is more than one bit of info you want gone after logout

    req.session.user_id =null;
    req.flash('success', 'log out successful!')
    res.redirect('/')
})

app.get('/secret', (req, res)=>{
    if(!req.session.user_id){
        req.flash('error','please login first.')
        return res.redirect('/login')
    } 
    res.send('Yay!! you can now see the secret!')
})



app.listen(3000, ()=>{
    console.log('Listening on port 3000')
})