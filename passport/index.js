const passport = require('passport');
const local = require('./localStrategy');
const {userDataJSON}=require('../data/js/user.js');

module.exports=()=>{
    passport.use('local',local);
    //Strategy 에서 user 존재 여부가 확인 된 후,
    //middleware 을 통해 user 객체가 넘어옴.
    passport.serializeUser((user,cb)=>{
        cb(null,user.id)
    })
    passport.deserializeUser((userId,cb)=>{
        //로그인 이후 user 와 관련된 정보를 인증할 때 이 함수가 호출됨.
        const user = userDataJSON[userId];
        if(user){cb(null,user);}
        else {cb(new Error('유저가 존재하지 않음'));}
    })
}