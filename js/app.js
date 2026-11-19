const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'baru saja':m<60?m+' mnt lalu':Math.round(m/60)+' jam lalu'};

// Penyimpanan data laporan (nanti bisa diganti Firebase)
const KEY='aegismap_hazards',ME='aegismap_me',TTL=6*3600*1000;
const seed=()=>[
 {id:'s1',type:'kebakaran',lat:-7.9770,lng:112.6340,desc:'Kebakaran ruko, petugas di lokasi',ts:Date.now()-20*6e4,verified:true},
 {id:'s2',type:'angin',lat:-7.9660,lng:112.6180,desc:'Angin kencang, pohon tumbang',ts:Date.now()-50*6e4,verified:false},
 {id:'s3',type:'banjir',lat:-7.9370,lng:112.6360,desc:'Genangan setinggi lutut',ts:Date.now()-90*6e4,verified:true},
 {id:'s4',type:'longsor',lat:-8.0050,lng:112.6280,desc:'Tanah longsor menutup separuh jalan',ts:Date.now()-120*6e4,verified:false}];
const DB={
 load(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d)return d}catch(e){}const s=seed();this.save(s);return s},
 save(d){try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}},
 add(h){const d=this.load();d.push(h);this.save(d)},
 subscribe(cb){addEventListener('storage',e=>{if(e.key===KEY)cb(this.load())});setInterval(()=>cb(this.load()),15000)}
};

// Peta
const map=L.map('map',{zoomControl:false}).setView([-7.9666,112.6326],13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
const HG={},FG={},hOn={},fOn={};
Object.keys(TYPES).forEach(k=>{HG[k]=L.layerGroup().addTo(map);hOn[k]=true});
Object.keys(FT).forEach(k=>{FG[k]=L.layerGroup().addTo(map);fOn[k]=true});
const pin=(t,u)=>L.divIcon({className:'',iconSize:[38,38],iconAnchor:[19,38],popupAnchor:[0,-36],html:`<div class="pin ${u?'unv':''}" style="background:${TYPES[t].c}"><span>${TYPES[t].l}</span></div>`});
const facIcon=t=>L.divIcon({className:'',iconSize:[34,34],iconAnchor:[17,17],popupAnchor:[0,-18],html:`<div class="fac" style="background:${FT[t].c}">${FT[t].e}</div>`});
const dirUrl=(a,b)=>`https://www.google.com/maps/dir/?api=1&destination=${a},${b}`;

FAC.forEach(f=>{
  L.marker([f.lat,f.lng],{icon:facIcon(f.t)}).addTo(FG[f.t]).bindPopup(
   `<b>${FT[f.t].e} ${esc(f.n)}</b><br>📍 ${esc(f.a)}<br>📞 ${esc(f.p)}<br>
    <a class="pbtn" href="tel:${f.tel}">Telepon</a><a class="pbtn" target="_blank" rel="noopener" href="${dirUrl(f.lat,f.lng)}">Rute</a>`);
});

let hazards=[],seen=new Set(),first=true;
function render(data){
  hazards=data.filter(h=>Date.now()-h.ts<TTL&&TYPES[h.type]);
  Object.values(HG).forEach(g=>g.clearLayers());
  hazards.forEach(h=>{
    const T=TYPES[h.type];
    h._m=L.marker([h.lat,h.lng],{icon:pin(h.type,!h.verified)}).addTo(HG[h.type]).bindPopup(
      `<b>${T.e} ${T.n}</b><br>${esc(h.desc||'-')}<br><small>${ago(h.ts)} · ${h.verified?'✅ Terverifikasi':'⚠ Belum diverifikasi'}</small><br>
       <button class="pbtn" onclick="openGuide('${h.type}')">📖 Panduan siaga</button>`);
    L.circle([h.lat,h.lng],{radius:T.r,color:T.c,weight:1,fillOpacity:.12}).addTo(HG[h.type]);
    if(!first&&!seen.has(h.id))toast(`${T.e} Laporan baru: ${T.n}`,true);
    seen.add(h.id);
  });
  first=false;$('nb').textContent=hazards.length;$('nf').textContent=FAC.length;
  $('upd').textContent='Diperbarui '+new Date().toLocaleTimeString('id-ID');
}

// Tombol filter di atas peta
$('chips').innerHTML=Object.entries(TYPES).map(([k,t])=>
 `<div class="chip" id="h-${k}"><button class="main" style="color:${t.c}" onclick="openGuide('${k}')">${t.e} ${t.n}</button><button class="eye" onclick="flt('${k}')" title="Tampil/sembunyi">👁</button></div>`).join('')
 +'<div class="sep"></div>'+Object.entries(FT).map(([k,t])=>
 `<div class="chip" id="f-${k}"><button class="main" onclick="fl('${k}')">${t.e} ${t.n}</button></div>`).join('');
function flt(k){hOn[k]=!hOn[k];$('h-'+k).classList.toggle('off',!hOn[k]);hOn[k]?map.addLayer(HG[k]):map.removeLayer(HG[k])}
function fl(k){fOn[k]=!fOn[k];$('f-'+k).classList.toggle('off',!fOn[k]);fOn[k]?map.addLayer(FG[k]):map.removeLayer(FG[k]);renderNear()}

// Panel panduan
function openGuide(k,tab){
  const T=TYPES[k],cur=tab||'info';
  const ul=a=>`<ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const body={info:`<p style="font-size:13.5px;line-height:1.6">${T.info}</p>`,sebelum:ul(T.sebelum),saat:ul(T.saat),sesudah:ul(T.sesudah)}[cur];
  const tabs=[['info','Tentang'],['sebelum','Siaga'],['saat','Saat terjadi'],['sesudah','Sesudah']];
  const d=$('drawer');d.style.display='block';d.style.animation='none';d.offsetHeight;d.style.animation='';
  d.innerHTML=`<button class="x" onclick="$('drawer').style.display='none'">✕</button>
   <span class="pill" style="background:${T.c}">${T.e} PANDUAN</span><h2>${T.n}</h2>
   <div class="tabs">${tabs.map(([i,n])=>`<button class="tab ${i===cur?'on':''}" onclick="openGuide('${k}','${i}')">${n}</button>`).join('')}</div>${body}
   <div class="nums">${T.call.map(([n,l])=>`<a href="tel:${n}">📞 ${n} · ${l}</a>`).join('')}</div>
   <small style="display:block;margin-top:14px;color:var(--mut);font-size:11px">Panduan umum. Utamakan arahan resmi BPBD, BMKG, dan petugas di lokasi.</small>`;
}

// Fasilitas terdekat
let userLL=null;
const dist=(a,b,c,d)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(c-a),dn=r(d-b);const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
function renderNear(){
  const o=userLL||[map.getCenter().lat,map.getCenter().lng];
  $('origin').textContent=userLL?'Dihitung dari lokasi GPS Anda':'Dihitung dari pusat peta (aktifkan GPS ◎)';
  const list=FAC.filter(f=>fOn[f.t]).map(f=>({...f,d:dist(o[0],o[1],f.lat,f.lng)})).sort((a,b)=>a.d-b.d).slice(0,4);
  $('near').innerHTML=list.map(f=>`<div class="near" onclick="map.flyTo([${f.lat},${f.lng}],16)"><div class="ic" style="background:${FT[f.t].c}">${FT[f.t].e}</div>
   <div><b>${esc(f.n)}</b><small>${f.d.toFixed(1)} km · ${esc(f.p)}</small></div><a class="call" href="tel:${f.tel}" onclick="event.stopPropagation()">📞</a></div>`).join('')||'<small>Aktifkan filter fasilitas.</small>';
}
map.on('moveend',renderNear);

// Pencarian, GPS, dan tema
$('q').addEventListener('keydown',async e=>{
  if(e.key!=='Enter'||!e.target.value.trim())return;
  try{const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&q='+encodeURIComponent(e.target.value));
  const d=await r.json();d[0]?map.flyTo([+d[0].lat,+d[0].lon],16):toast('Lokasi tidak ditemukan')}catch(x){toast('Pencarian gagal')}
});
let meMk;
function locate(){
  if(!navigator.geolocation)return toast('GPS tidak didukung');
  navigator.geolocation.getCurrentPosition(p=>{userLL=[p.coords.latitude,p.coords.longitude];map.flyTo(userLL,15);
   meMk?meMk.setLatLng(userLL):meMk=L.circleMarker(userLL,{radius:8,color:'#fff',weight:3,fillColor:'#6366f1',fillOpacity:1}).addTo(map);renderNear()},
   ()=>toast('Izin lokasi ditolak'),{enableHighAccuracy:true});
}
const setTheme=d=>{document.body.classList.toggle('dark',d);$('theme').textContent=d?'☀️':'🌙';try{localStorage.setItem('aegis_dark',d?1:0)}catch(e){}};
$('theme').onclick=()=>setTheme(!document.body.classList.contains('dark'));
setTheme((()=>{try{const s=localStorage.getItem('aegis_dark');if(s!==null)return s==='1'}catch(e){}return matchMedia('(prefers-color-scheme:dark)').matches})());

// Laporan
const dlg=$('dlg');let picked=null,pickMk;
$('rt').innerHTML=Object.entries(TYPES).map(([k,t])=>`<option value="${k}">${t.e} ${t.n}</option>`).join('');
function setPick(ll){picked=ll;$('rl').textContent=`Lat ${ll[0].toFixed(5)}, Lng ${ll[1].toFixed(5)}`;pickMk?pickMk.setLatLng(ll):pickMk=L.marker(ll,{opacity:.6}).addTo(map)}
function openReport(){setPick([map.getCenter().lat,map.getCenter().lng]);dlg.showModal()}
map.on('click',e=>{if(dlg.open||pickMk)setPick([e.latlng.lat,e.latlng.lng])});
function useGps(){navigator.geolocation?.getCurrentPosition(p=>setPick([p.coords.latitude,p.coords.longitude]),()=>toast('Izin lokasi ditolak'))}
function submitReport(){
  const last=+localStorage.getItem('aegis_last')||0;
  if(Date.now()-last<60000)return toast('Tunggu 1 menit sebelum melapor lagi');
  const h={id:'u'+Date.now(),type:$('rt').value,lat:picked[0],lng:picked[1],desc:$('rd').value.trim().slice(0,200),ts:Date.now(),verified:false};
  DB.add(h);localStorage.setItem('aegis_last',Date.now());
  const m=JSON.parse(localStorage.getItem(ME)||'[]');m.push(h.id);localStorage.setItem(ME,JSON.stringify(m));
  dlg.close();if(pickMk){map.removeLayer(pickMk);pickMk=null}$('rd').value='';
  render(DB.load());map.flyTo([h.lat,h.lng],15);toast('Laporan terkirim. Terima kasih!');
}
function myReports(){const ids=JSON.parse(localStorage.getItem(ME)||'[]');const m=hazards.filter(h=>ids.includes(h.id));
  alert(m.length?m.map(h=>`${TYPES[h.type].n} - ${ago(h.ts)}`).join('\n'):'Belum ada laporan aktif dari Anda.')}

// Notifikasi singkat dan inisialisasi
let unread=0;
function toast(msg,n){const t=$('toast');t.textContent=msg;t.style.display='block';clearTimeout(t._x);t._x=setTimeout(()=>t.style.display='none',3500);
  if(n){unread++;$('cnt').style.display='grid';$('cnt').textContent=unread}}
$('bell').onclick=()=>{unread=0;$('cnt').style.display='none'};
render(DB.load());DB.subscribe(render);renderNear();