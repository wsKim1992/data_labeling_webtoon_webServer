const urlParse = require('url-parse');

exports.isNotLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        next();
    }else{
        res.status(403).json({success:false,message:'로그인한 상태 입니다'});
    }
}

exports.isLoggedIn = (req,res,next)=>{
    if(req.isAuthenticated()){
        next();
    }else{
        res.status(403).json({success:false,message:'로그인하지 않은 상태 입니다'})
    }
}

const jwt = require('jsonwebtoken');

exports.verifyToken=(req,res,next)=>{
    try{
        req.docoded = jwt.verify(req.headers.authorization,process.env.JWT_SECRET);
        next();
    }catch(err){
        if(err.name==='TokenExpiredError'){
            if(req.user){
                const token = jwt.sign({id:req.user.id},JWT_SECRET,{
                    expiresIn:'7d',
                    issuer:'nestyle_webpage'
                })
                res.status(200).json({success:true,token});
            }else{
                res.status(401).json({success:false,message:'invalid token'});
            }
        }else{
            console.log('jwt error');
            let error = new Error ('Not a valid User.');
            error.status = 401;
            next(error);
        }
    }
}

exports.checkOrigin=(req,res,next)=>{
    const {headers:{origin}}=req;
    const originParsed = urlParse(origin);
    if(originParsed.hostname==='1.201.8.82'&&parseInt(originParsed.port)===9992){
        next();
    }else{
        return res.status(403).json({success:false,message:'Access Prohibited!'});
    }
}

const {userDataJSON}=require('../data/js/user');

exports.checkEmailExists=(req,res,next)=>{
    const {email}=req.body;
    const userInfo = Object.entries(userDataJSON).find(userData=>userData[1].email===email);
    console.log(userInfo);
    if(userInfo){res.status(401).json({success:false,message:'이미 가입된 사용자 입니다'})}
    else{next();}
}