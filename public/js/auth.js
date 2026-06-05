
async function login(){
const email=document.getElementById('email').value;
const password=document.getElementById('password').value;
const r=await api('/users/login',{method:'POST',body:JSON.stringify({email,password})});
if(r.success){localStorage.user=JSON.stringify(r.data);location='dashboard.html';}
else alert(r.error);
}
