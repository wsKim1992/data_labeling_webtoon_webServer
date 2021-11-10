const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const {userDataJSON}=require('../data/js/user.js');
const urlParser = require('url-parse');

module.exports = new localStrategy(
    {
        usernameField:'email',
        passwordField:'password',
        session:true,
        passReqToCallback:true,//callback 함수의 인자를 (req,email,password,next)형태로 만들어 줄 수 있음..
    },async(req,email,password,next)=>{
        const {headers:{origin}}=req;
        const parsedOrigin = urlParser(origin,true);
        const hostname = parsedOrigin.hostname;
        const port = parsedOrigin.port;
        try{
            if(hostname==='1.201.8.82'&&(parseInt(port,10)===process.env.PORT||parseInt(port,10)===9993)){
                
                userDataArr=Object.entries(userDataJSON);
                const key = Object.keys(userDataJSON).filter(key=>{
                    if(userDataJSON[key].email===email){return key}
                })
                const userObj = userDataJSON[key[0]];
               
                if(!userObj){
                    next(null,false,'User 정보 존재하지 않음!!');
                }else{
                    const isPwdCorrect = await bcrypt.compare(password,userObj.password);
                    console.log(isPwdCorrect);
                    if(!isPwdCorrect){
                        next(null,false,'User 정보 존재하지 않음!!');
                    }else{
                        userObj.id=key[0];
                        next(null,userObj);
                    }
                }
            }else{
                next(new Error('host not allowed!',false,'host not allowed!'));
            }
        }catch(err){
            console.error(err);
            next(err,false,'에러발생...');
        }
    })
