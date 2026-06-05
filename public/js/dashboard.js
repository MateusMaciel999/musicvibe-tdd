
(async()=>{
const user=JSON.parse(localStorage.user||'{}');
const tracks=await api('/tracks');
document.getElementById('tracks').innerHTML=(tracks.data||[]).map(t=>
`<div class="card"><h3>${t.title}</h3><button onclick="play(${t.id})">▶ Tocar</button></div>`).join('');
if(user.id){
 const p=await api('/playlists/user/'+user.id);
 document.getElementById('playlists').innerHTML=JSON.stringify(p.data||[]);
}
})();
async function play(id){await api('/tracks/'+id+'/play',{method:'POST'});alert('Play contabilizado');}
