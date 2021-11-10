const express = require('express');
const router = express.Router();
const fs = require('fs');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);
const path = require('path');
const {isNotLoggedIn,isLoggedIn,verifyToken,checkOrigin,checkEmailExists}=require('./middlewares');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {sendMail,createRandomBytes}=require('./tools');
const bcrypt=require('bcrypt');

let {userDataJSON} = require('../data/js/user');

const {fork} = require('child_process');
const schedule = require('node-schedule');

const job = schedule.scheduleJob('*/5 * * * * *',(jobTime)=>{
    const program = path.resolve(__dirname,'./tools','scheduleUpdateData.js')
    const forkOption = {
        cwd:path.join(__dirname,'./tools'),
        detached:true
    }
    const childProcess = fork(program,[JSON.stringify(userDataJSON)],forkOption);
    childProcess.unref();
})

const cors = require('cors');
let originWhiteList = ['http://1.201.8.82:9992','http://1.201.8.82:9993'];
const corsOption = {
    origin:(origin,cb)=>{
        console.log(origin);
        if(originWhiteList.indexOf(origin)!==-1){cb(null,true)}
        else{
            cb(new Error("Origin Not Allowed!"));    
        }
    },
    credentials:true,
}

/* router.get('/',(req,res)=>{
    if(!req.user)res.status(200).sendFile(path.join(__dirname,'../index.html'));
    else res.status(200).sendFile(path.join(__dirname,'../wooseok_index.html'));
}) */

router.patch('/confirm_jwt',cors(corsOption),verifyToken,(req,res)=>{
    res.status(200).json({success:true});
})

router.post('/login',cors(corsOption),isNotLoggedIn,(req,res,next)=>{
    passport.authenticate('local',(err,user,message)=>{
        
        if(err){
            console.log('login error');
            console.log(err);
            return next(new Error(err.message));
        }
        if(!user){
            return res.status(200).json({success:false,message});
        }
        return req.login(user,async(loginError)=>{
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            try{
                const token = await jwt.sign({id:user.id},process.env.JWT_SECRET,{
                    expiresIn:'7d',
                    issuer:'nestyle_webpage'
                })
                const userInfo = {email:user.email};
                return res.status(200).json({success:true,token,userInfo,message:'로그인 성공!!'});
            
            }catch(err){
                console.error(err);
                next(err);               
            }
        })
    })(req,res,next)
})

router.post('/logout',cors(corsOption),isLoggedIn,(req,res)=>{
    req.logout();
    req.session.destroy();
    res.status(200).json({success:true,message:'로그아웃 성공!'});
})

router.post('/authenticate_user',cors(corsOption), isLoggedIn,verifyToken,(req,res)=>{
    const userInfo = {email:req.user.email};
    res.status(200).json({success:true,...userInfo});
})

router.post('/check_no_session',isNotLoggedIn,(req,res)=>{
    res.status(200).json({success:true,message:'session이 없습니다. 로그인 해주세요!'})
})

router.post('/sendMail',checkOrigin,isNotLoggedIn,checkEmailExists,async(req,res)=>{
    const {email} = req.body;
    const code = await createRandomBytes(4);
    const result =  sendMail(email,code);
    console.log(result);
    if(result){
        req.session.code = code;
        res.status(200).json({success:true,message:'전송된 메일의 인증코드를 입력하면 비밀번호를 만들수 있습니다.'});    
    }else {
        res.status(503).json({success:false,message:'이메일 서버 오류'});
    }
})

router.post('/confirm_code',isNotLoggedIn,(req,res)=>{
    const code = req.headers.authorization;
    console.log(`code in session : ${req.session.code}`);
    console.log(`code from request : ${code}`);
    if(code===req.session.code){
        res.status(200).json({success:true,message:'인증 성공'});
    }else{
        res.status(406).json({success:false,message:'인증코드가 맞지 않습니다. 확인해주세요.'});
    }   
})

router.post('/register',isNotLoggedIn,checkEmailExists,async(req,res)=>{
    const code = req.headers.authorization;
    if(code===req.session.code){
        delete req.session.code;
        req.session.destroy();
        const {email,password}=req.body;
        const hashedPwd = await bcrypt.hash(password,10);
        userDataJSON[Date.now()]={email,password:hashedPwd}
        res.status(200).json({success:true,message:'회원 등록 성공. 로그인 페이지로 이동해서 로그인을 해주세요!'});
    }else{
        res.status(406).json({success:false,message:'회원 등록 실패'});
    }   
})
module.exports = {userRouter:router};