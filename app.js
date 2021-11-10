const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const {userRouter}= require('./router/user');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./passport');
const app = express();
const {createProxyMiddleware} = require("http-proxy-middleware");

const sessionOptions = {
    path:path.join(__dirname,'./sessions'),
    ttl:3600*4,
    fileExtension:'.json',
}

const sessionMiddleware = session({
    resave:false,
    path:'/user',
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    store:new FileStore(sessionOptions),
    cookie:{
        httpOnly:true,
        secure:false//https 일 때만..
    }
})

//proxy option 설정
const proxyOptionsForCallingAPI = {
    target :'http://localhost:8001',
    changeOrigin:true
};
const proxyOptionForCallingAPIResult={
    target :'http://localhost:8001',
    changeOrigin:true
}
const proxyOptionForCallingColorLayerAPI={
    target :'http://localhost:8001',
    changeOrigin:true
}


app.use('/request_image',createProxyMiddleware(proxyOptionsForCallingAPI));
app.use('/static',createProxyMiddleware(proxyOptionForCallingAPIResult));
app.use('/colorLayer',createProxyMiddleware(proxyOptionForCallingColorLayerAPI));

app.set('port',process.env.PORT||9993);
app.set('view engine','html');

app.use('/statics',express.static(path.join(__dirname,'../front/data_labeling_webtoon/build/statics')));
app.use('/assets',express.static(path.join(__dirname,'static')));

passportConfig();

app.use(express.json());//application/json
app.use(express.urlencoded({extended:false}));//application/x-www-form-urlencoded
//POST 형식의 json 데이터를 받을 때 위 2개의 미들웨어들을 사용해야함.

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);


app.use(passport.initialize());
app.use(passport.session());

app.get('*',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../front/data_labeling_webtoon/build/index.html'));
})

app.use('/user',userRouter);

app.use((req,res,next)=>{
    const error = new Error(`${req.url}과 ${req.method}에 해당되는 라우터가 없습니다`);
    error.status = 404;
    next();
})

app.use((err,req,res,next)=>{
    console.log('error');
    console.log(err.message);
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !=='production'?err:{};
    res.status(err.status||500).json({message:err.message});
})

const {readFileSync} = require('fs');
const {userDataJSON}=require('./data/js/user.js');

const server =app.listen(app.get('port'),()=>{
    console.log(`${app.get('port')}에서 server  실행중..`);
    const jsonData = readFileSync(path.join(__dirname,'./data/json/user.json'),{encoding:'utf8',flag:'r'});
    Object.assign(userDataJSON,JSON.parse(jsonData));
})




