// const a=new Promise((success,error)=>{
//     setTimeout(()=>{return "GG"},5000);
//
// });
// await a.then(console.log("Hi"),console.log("Bye"))
// console.log("HI")
import axios from 'axios';

function getData(){
    console.log("GET data")
    let test=axios.get('https://httpbin.org/get')
    console.log("GET data 2")

    return test
    console.log("GET data XD")

}

let xd()
async function getData2(){
    console.log("GET data 3")

    let xd=await getData()
    console.log("GET data 4")

    console.log(xd.data)

}
getData2()

console.log("HI")



