let userDataJSON = {0:{email:'david@gmail.com',password:'1234'},1:{email:'dntjr9214@gmail.com',password:'1235'}};



const data = Object.keys(userDataJSON).filter(key=>{
    if(userDataJSON[key].email==='davidf@gmail.com'){return key}
})

console.log(userDataJSON[data[0]]);