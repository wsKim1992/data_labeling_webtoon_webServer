const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

exports.sendMail = async(email,code)=>{
    try{
        const mailConfig = {
            service:'gmail',
            host:'smtp.gmail.com',
            port:587,
            auth:{
                user:process.env.EMAIL_ADDR,
                pass:process.env.EMAIL_PASSWORD
            },
        }
        let message = {
            from:process.env.EMAIL_ADDR,
            to:email,
            subject:'ETRI 웹툰 생성 플랫폼 계정인증 메일 입니다.',
            html:`<h1>인증 코드 : ${code}</h1>`
        }

        let transporter = nodemailer.createTransport(mailConfig);
        transporter.sendMail(message);
        return true;
    }catch(err){
        //console.error(new Error('메일 송신 실패'));
        return false
    }
}