let count = 1
let approxSymbol = ""

// 編集用
let editIndex = null
let editApproxSymbol = ""

// -----------------------------
// 鳥リスト管理
// -----------------------------

function getBirdList(){
return JSON.parse(localStorage.getItem("birdList") || "[]")
}

function saveBirdList(list){
localStorage.setItem("birdList", JSON.stringify(list))
}

function renderBirdButtons(){

const area = document.getElementById("birdButtons")
area.innerHTML = ""

let list = getBirdList()

list.forEach(bird=>{

let btn = document.createElement("button")
btn.textContent = bird

btn.onclick = function(){
document.getElementById("species").value = bird
}

area.appendChild(btn)

})

renderBirdSettings()

}

function renderBirdSettings(){

let ul = document.getElementById("customBirdList")
ul.innerHTML = ""

let list = getBirdList()

list.forEach((bird,i)=>{

let li = document.createElement("li")

li.textContent = bird + " "

let del = document.createElement("button")
del.textContent = "×"

del.onclick = function(){

list.splice(i,1)
saveBirdList(list)
renderBirdButtons()

}

li.appendChild(del)

ul.appendChild(li)

})

}

function addBird(){

let name = document.getElementById("newBird").value

if(!name) return

let list = getBirdList()

if(list.length >= 10){
alert("最大10種まで")
return
}

list.push(name)

saveBirdList(list)

document.getElementById("newBird").value=""

renderBirdButtons()

}

// -----------------------------
// sp.ボタン
// -----------------------------

function toggleSp(){

let input = document.getElementById("species")

let name = input.value.trim()

if(name === "sp."){
input.value = ""
return
}

if(name.endsWith(" sp.")){
input.value = name.replace(" sp.","")
}else{

if(name !== ""){
input.value = name + " sp."
}else{
input.value = "sp."
}

}

}

// -----------------------------
// 数入力
// -----------------------------

function plus(){
count++
updateCount()
}

function minus(){
if(count>1) count--
updateCount()
}

function updateCount(){

document.getElementById("count").textContent = count

let input = document.getElementById("countInput")
if(input) input.value = count

}

// -----------------------------
// 概数
// -----------------------------

function setApprox(symbol){

if(approxSymbol === symbol){
approxSymbol = ""
}else{
approxSymbol = symbol
}

let area = document.getElementById("approx")

if(area){
area.textContent = approxSymbol
}

}

// -----------------------------
// 記録保存
// -----------------------------

function saveBird(){

const species = document.getElementById("species").value

let input = document.getElementById("countInput")

let countValue = count

if(input && input.value !== ""){
countValue = input.value
}

const finalCount = countValue + approxSymbol

const record = {
species: species,
count: finalCount,
time: new Date()
}

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

logs.push(record)

localStorage.setItem("birdLogs", JSON.stringify(logs))

// リセット
count = 1
approxSymbol = ""

document.getElementById("count").textContent = 1

if(input) input.value = 1

let approxArea = document.getElementById("approx")
if(approxArea) approxArea.textContent = ""

document.getElementById("species").value = ""

showLogs()

}

// -----------------------------
// 今日の記録表示
// -----------------------------

function showLogs(){

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

let list = document.getElementById("list")
list.innerHTML = ""

const today = new Date().toDateString()

logs.forEach((r,index)=>{

let recordDate = new Date(r.time).toDateString()

if(recordDate === today){

let date = new Date(r.time)

let hour = date.getHours()
let minute = String(date.getMinutes()).padStart(2,"0")

let timeText = hour + ":" + minute

let li = document.createElement("li")

li.textContent = timeText + " " + r.species + " " + r.count + " "

let editBtn = document.createElement("button")
editBtn.textContent = "編集"

editBtn.onclick = function(){
editRecord(index)
}

let delBtn = document.createElement("button")
delBtn.textContent = "削除"

delBtn.onclick = function(){
deleteRecord(index)
}

li.appendChild(editBtn)
li.appendChild(delBtn)

list.appendChild(li)

}

})

}

// -----------------------------
// 削除
// -----------------------------

function deleteRecord(index){

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

logs.splice(index,1)

localStorage.setItem("birdLogs", JSON.stringify(logs))

showLogs()

}

// -----------------------------
// 編集（ポップアップ）
// -----------------------------

function editRecord(index){

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

let r = logs[index]

editIndex = index

document.getElementById("editSpecies").value = r.species

let num = r.count.replace(/[+\-±]/g,"")
let symbol = r.count.replace(/[0-9]/g,"")

document.getElementById("editCount").value = num

editApproxSymbol = symbol

document.getElementById("editApprox").textContent = symbol

document.getElementById("editModal").style.display="block"

}

// -----------------------------
// 編集概数
// -----------------------------

function setEditApprox(symbol){

if(editApproxSymbol === symbol){
editApproxSymbol = ""
}else{
editApproxSymbol = symbol
}

document.getElementById("editApprox").textContent = editApproxSymbol

}

// -----------------------------
// 編集更新
// -----------------------------

function updateRecord(){

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

let species = document.getElementById("editSpecies").value
let count = document.getElementById("editCount").value

let r = logs[editIndex]

logs[editIndex] = {
species: species,
count: count + editApproxSymbol,
time: r.time
}

localStorage.setItem("birdLogs", JSON.stringify(logs))

closeEditModal()

showLogs()

}

// -----------------------------
// 編集閉じる
// -----------------------------

function closeEditModal(){
document.getElementById("editModal").style.display="none"
}

// -----------------------------
// テキスト出力
// -----------------------------

function exportText(){

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

const today = new Date().toDateString()

let text = ""

logs.forEach(r=>{

let recordDate = new Date(r.time).toDateString()

if(recordDate === today){

let date = new Date(r.time)

let hour = date.getHours()
let minute = String(date.getMinutes()).padStart(2,"0")

let time = hour + ":" + minute

text += time + " " + r.species + " " + r.count + "\n"

}

})

document.getElementById("exportArea").textContent = text

}

// -----------------------------
// モーダル外クリックで閉じる
// -----------------------------

const modal = document.getElementById("editModal");

modal.addEventListener("click", function(event){

if(event.target === modal){
closeEditModal();
}

});

// -----------------------------
// 種ごと集計
// -----------------------------

function normalizeSpecies(name){

name = name.trim()

// sp.を含む場合
if(name.endsWith("sp.")){
return name
}

return name

}

// 数字だけ取り出す
function extractNumber(count){

let num = parseInt(count.replace(/[^\d]/g,""))

if(isNaN(num)) return 0

return num

}

function showSummary(){

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

const today = new Date().toDateString()

let speciesTotal = {}
let timeTotal = {}

logs.forEach(r=>{

let recordDate = new Date(r.time).toDateString()

if(recordDate !== today) return

let species = normalizeSpecies(r.species)

let num = extractNumber(r.count)

// ----------------
// 種ごと
// ----------------

if(!speciesTotal[species]){
speciesTotal[species] = 0
}

speciesTotal[species] += num


// ----------------
// 時間ごと
// ----------------

let date = new Date(r.time)

let hour = date.getHours()

if(!timeTotal[hour]){
timeTotal[hour] = {}
}

if(!timeTotal[hour][species]){
timeTotal[hour][species] = 0
}

timeTotal[hour][species] += num

})


// ----------------
// 種ごと表示
// ----------------

let text = ""

Object.keys(speciesTotal)
.sort()
.forEach(s=>{

text += s + " : " + speciesTotal[s] + "\n"

})

document.getElementById("summaryArea").textContent = text


// ----------------
// 時間ごと表示
// ----------------

let timeText = ""

Object.keys(timeTotal)
.sort((a,b)=>a-b)
.forEach(hour=>{

timeText += hour + "時\n"

Object.keys(timeTotal[hour])
.sort()
.forEach(s=>{

timeText += "  " + s + " : " + timeTotal[hour][s] + "\n"

})

timeText += "\n"

})

document.getElementById("timeSummaryArea").textContent = timeText

}

renderBirdButtons()
updateCount()
showLogs()
