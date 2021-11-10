const fs = require('fs');

const writeStream = fs.createWriteStream('../../data/json/user.json');

const util = require('util');
const readStream = require('stream').Readable;

function MyReadStream(str,opt){
    if(!(this instanceof MyReadStream)){return new MyReadStream(str,opt);}
    readStream.call(this,opt);
    this.str = str;
}
MyReadStream.prototype._read = function(size){
    let chunk = this.str.slice(0,size);
    if(chunk){
        this.str = this.str.slice(size);
        this.push(chunk);
    }else{
        this.push(null);
    }
}
util.inherits(MyReadStream,readStream);
let stream = new MyReadStream(process.argv[2],{highWaterMark:64});
stream.on('data',(chunk)=>{
    writeStream.write(chunk);
})

stream.on('end',()=>{
    writeStream.end();
})