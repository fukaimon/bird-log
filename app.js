let count = 1
let approxSymbol = ""

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

// sp.だけの状態
if(name === "sp."){

input.value = ""

return

}

// 「○○ sp.」の場合
if(name.endsWith(" sp.")){

input.value = name.replace(" sp.","")

}else{

// 名前あり
if(name !== ""){
input.value = name + " sp."
}else{
// 空欄なら sp. を入力
input.value = "sp."
}

}

}

// -----------------------------
// 数入力（＋ − ボタン）
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
// 概数記号
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
const time = new Date()

let input = document.getElementById("countInput")

let countValue = count

if(input && input.value !== ""){
countValue = input.value
}

const finalCount = countValue + approxSymbol

const record = {
species: species,
count: finalCount,
time: time
}

let logs = JSON.parse(localStorage.getItem("birdLogs") || "[]")

logs.push(record)

localStorage.setItem("birdLogs", JSON.stringify(logs))

// リセット（デフォルト1）
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

renderBirdButtons()
updateCount()
showLogs()
