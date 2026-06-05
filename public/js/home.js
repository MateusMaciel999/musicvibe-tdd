
(async()=>{
const res=await api('/tracks');
document.getElementById('tracks').innerHTML=(res.data||[]).map(t=>
`<div class="card"><h3>${t.title}</h3><p>${t.artist||''}</p></div>`).join('');
})();
