async function gg(){
const a=await new Promise(()=>{
        if(1==2) {
            return "Complete"
        } else {
            return "Rip"
        }
});
return a;
}
const xd=gg()
let gx=xd.resolve()
console.log(gx)
console.log(xd)
function log(val){
    console.log("LOG FUNCTION")
    console.log(val)
}
function err(val){
    console.log("ERROR FUNCTION")
    console.log(val)
}


console.log("HI")

// import axios from 'axios';
//
// function getData(){
//     console.log("GET data")
//     let test=axios.get('https://httpbin.org/get')
//     console.log("GET data 2")
//
//     return test
//     console.log("GET data XD")
//
// }
//
// let xd()
// async function getData2(){
//     console.log("GET data 3")
//
//     let xd=await getData()
//     console.log("GET data 4")
//
//     console.log(xd.data)
//
// }
// getData2()
//
// console.log("HI")
//


