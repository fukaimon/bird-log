let count = 0;
let approxSymbol = "";
let editIndex = null;
let editApproxSymbol = "";
let currentLat = null;
let currentLon = null;

// 鳥リスト管理
function getBirdList(){ return JSON.parse(localStorage.getItem("birdList")||"[]"); }
function saveBirdList(list){ localStorage.setItem("birdList",JSON.stringify(list)); }

function renderBirdButtons(){
  const area=document.getElementById("birdButtons"); area.innerHTML=""
  let list=getBirdList()
  list.forEach(bird=>{
    let btn=document.createElement("button")
    btn.textContent=bird
    btn.onclick=()=>document.getElementById("species").value=bird
    area.appendChild(btn)
  })
  renderBirdSettings()
}

function renderBirdSettings(){
  const ul=document.getElementById("customBirdList"); ul.innerHTML=""
  let list=getBirdList()
  list.forEach((bird,i)=>{
    let li=document.createElement("li"); li.textContent=bird+" "
    let del=document.createElement("button"); del.textContent="×"
    del.onclick=()=>{ list.splice(i,1); saveBirdList(list); renderBirdButtons(); }
    li.appendChild(del); ul.appendChild(li)
  })
}

function addBird(){ 
  const name=document.getElementById("newBird").value; 
  if(!name) return
  let list=getBirdList()
  if(list.length>=10){ alert("最大10種まで"); return; }
  list.push(name); saveBirdList(list); document.getElementById("newBird").value=""; renderBirdButtons();
}

// spボタン
function toggleSp(){ let input=document.getElementById("species"); let name=input.value.trim()
  if(name==="sp."){input.value=""; return;}
  if(name.endsWith(" sp.")){input.value=name.replace(" sp.","")}else{input.value=name?name+" sp.":"sp."}
}

// 数入力
function plus(){ count++; updateCount(); }
function minus(){ if(count>0) count--; updateCount(); }
function addNumber(num){ count+=num; updateCount(); }
function resetCount(){ count=0; updateCount(); }
function updateCount(){ document.getElementById("count").textContent=count; }

// 概数
function setApprox(symbol){ approxSymbol=(approxSymbol===symbol?"":symbol); document.getElementById("approx").textContent=approxSymbol; }
function setEditApprox(symbol){ editApproxSymbol=(editApproxSymbol===symbol?"":symbol); document.getElementById("editApprox").textContent=editApproxSymbol; }

// 緯度経度取得
function getCurrentLocation(callback){
  if(!navigator.geolocation){ callback(null,null); return; }
  navigator.geolocation.getCurrentPosition(
    pos=>{ currentLat=pos.coords.latitude.toFixed(6); currentLon=pos.coords.longitude.toFixed(6);
      document.getElementById("latDisplay").textContent=currentLat; document.getElementById("lonDisplay").textContent=currentLon; callback(currentLat,currentLon); },
    ()=>{ currentLat=null; currentLon=null; document.getElementById("latDisplay").textContent="-"; document.getElementById("lonDisplay").textContent="-"; callback(null,null); }
  )
}

// 保存
function saveBird(){
  const species=document.getElementById("species").value
  if(!species) return
  const finalCount=count+approxSymbol
  getCurrentLocation((lat,lon)=>{
    const record={species:species,count:finalCount,time:new Date(),lat:lat,lon:lon}
    let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]"); logs.push(record); localStorage.setItem("birdLogs",JSON.stringify(logs))
    count=0; approxSymbol=""; updateCount(); document.getElementById("approx").textContent=""; document.getElementById("species").value=""
    showLogs(); showSummary(); exportText(); exportCSV();
  })
}

// 今日の記録表示
function showLogs(){
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]")
  const list=document.getElementById("list"); list.innerHTML=""
  const today=new Date().toDateString()
  logs.forEach((r,index)=>{
    if(new Date(r.time).toDateString()!==today) return
    let date=new Date(r.time)
    let timeText=date.getHours()+":"+String(date.getMinutes()).padStart(2,"0")
    let li=document.createElement("li"); li.textContent=timeText+" "+r.species+" "+r.count
    let editBtn=document.createElement("button"); editBtn.textContent="編集"; editBtn.onclick=()=>editRecord(index)
    let delBtn=document.createElement("button"); delBtn.textContent="削除"; delBtn.onclick=()=>deleteRecord(index)
    li.appendChild(editBtn); li.appendChild(delBtn); list.appendChild(li)
  })
}

// 削除
function deleteRecord(index){ let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]"); logs.splice(index,1); localStorage.setItem("birdLogs",JSON.stringify(logs)); showLogs(); showSummary(); exportText(); exportCSV(); }

// 編集
function editRecord(index){
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]"); let r=logs[index]; editIndex=index
  document.getElementById("editSpecies").value=r.species
  let num=r.count.replace(/[+\-±]/g,""); let symbol=r.count.replace(/[0-9]/g,"")
  document.getElementById("editCount").value=num; editApproxSymbol=symbol; document.getElementById("editApprox").textContent=symbol
  document.getElementById("editModal").style.display="block"
}
function updateRecord(){
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]")
  let species=document.getElementById("editSpecies").value
  let countValue=document.getElementById("editCount").value
  let r=logs[editIndex]
  logs[editIndex]={species:species,count:countValue+editApproxSymbol,time:r.time,lat:r.lat,lon:r.lon}
  localStorage.setItem("birdLogs",JSON.stringify(logs))
  closeEditModal(); showLogs(); showSummary(); exportText(); exportCSV();
}
function closeEditModal(){ document.getElementById("editModal").style.display="none"; }
document.getElementById("editModal").addEventListener("click", e=>{ if(e.target===document.getElementById("editModal")) closeEditModal(); })

// 総計
function normalizeSpecies(name){ return name.trim(); }
function extractNumber(count){ let n=parseInt(count.replace(/[^\d]/g,"")); return isNaN(n)?0:n; }
function showSummary(){
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]")
  const today=new Date().toDateString(); let speciesTotal={}, timeTotal={}
  logs.forEach(r=>{ if(new Date(r.time).toDateString()!==today) return
    let species=normalizeSpecies(r.species), num=extractNumber(r.count)
    speciesTotal[species]=(speciesTotal[species]||0)+num
    let hour=new Date(r.time).getHours()
    timeTotal[hour]=timeTotal[hour]||{}; timeTotal[hour][species]=(timeTotal[hour][species]||0)+num
  })
  let text=""; Object.keys(speciesTotal).sort().forEach(s=>{ text+=s+" : "+speciesTotal[s]+"\n" })
  document.getElementById("summaryArea").textContent=text

  let timeText=""; Object.keys(timeTotal).sort((a,b)=>a-b).forEach(hour=>{
    timeText+=hour+"時\n"; Object.keys(timeTotal[hour]).sort().forEach(s=>{ timeText+="  "+s+" : "+timeTotal[hour][s]+"\n" }); timeText+="\n"
  })
  document.getElementById("timeSummaryArea").textContent=timeText
}

// 従来形式テキスト出力
function exportText(){
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]")
  const today=new Date().toDateString()
  let text=""
  logs.forEach(r=>{ if(new Date(r.time).toDateString()!==today) return
    let date=new Date(r.time)
    let time=date.getHours()+":"+String(date.getMinutes()).padStart(2,"0")
    text+=time+" "+r.species+" "+r.count+"\n"
  })
  document.getElementById("exportAreaText").textContent=text
}

// CSV形式出力
function exportCSV(){
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]")
  const today=new Date().toDateString()
  let text="時間,種名,数,緯度,経度\n"
  logs.forEach(r=>{ if(new Date(r.time).toDateString()!==today) return
    let date=new Date(r.time); let time=date.getHours()+":"+String(date.getMinutes()).padStart(2,"0")
    let lat=r.lat!==null?r.lat:""; let lon=r.lon!==null?r.lon:""
    text+=`${time},${r.species},${r.count},${lat},${lon}\n`
  })
  document.getElementById("exportAreaCSV").textContent=text
}

// 折り畳み
function toggleSection(id){ const s=document.getElementById(id); s.style.display=(s.style.display==="block")?"none":"block"; }

// 今日の記録一括削除
function clearTodayLogs(){ if(!confirm("今日の記録をすべて削除します。")) return;
  let logs=JSON.parse(localStorage.getItem("birdLogs")||"[]")
  const today=new Date().toDateString(); logs=logs.filter(r=>new Date(r.time).toDateString()!==today)
  localStorage.setItem("birdLogs",JSON.stringify(logs)); showLogs(); showSummary(); exportText(); exportCSV();
}

// 初期表示
renderBirdButtons(); updateCount(); showLogs(); showSummary(); exportText(); exportCSV();
