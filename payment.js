import fetch from 'node-fetch';
var credit=0;
var waiver=0;
const semesters = [{"semesterId": "222", "semesterYear": 2022, "semesterName": "Summer"}, {
    "semesterId": "221",
    "semesterYear": 2022,
    "semesterName": "Spring"
}, {"semesterId": "213", "semesterYear": 2021, "semesterName": "Fall"}, {
    "semesterId": "212",
    "semesterYear": 2021,
    "semesterName": "Summer"
}, {"semesterId": "211", "semesterYear": 2021, "semesterName": "Spring"}, {
    "semesterId": "203",
    "semesterYear": 2020,
    "semesterName": "Fall"
}, {"semesterId": "202", "semesterYear": 2020, "semesterName": "Summer"}]

async function getRes(sid){
fetch(`http://software.diu.edu.bd:8189/paymentLedger?semesterId=${sid}`, {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "accesstoken": "be4a0759-68c2-11ed-a05f-7754785bd9f8",
        "content-type": "application/json",
        "Referer": "http://studentportal.diu.edu.bd/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
}).then((response) => response.json())
    .then((data) => {
        data.forEach((item) => {
            console.log(item.headDescription)
            console.log(item.credit)
            if (item.headDescription != "Waiver") {
                credit = credit + item.credit
            } else {
                waiver = waiver + item.credit
            }
        });
    });
}

semesters.forEach((semester)=>{
    getRes(semester.semesterId)
})
setTimeout(()=>{
    console.log("CREDIT " + credit);
    console.log("Waiver " + waiver);

},5000)