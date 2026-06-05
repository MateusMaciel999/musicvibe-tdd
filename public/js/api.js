
const API='http://localhost:3000/api';
async function api(url,opt={}){
 const r=await fetch(API+url,{headers:{'Content-Type':'application/json'},...opt});
 return r.json();
}
