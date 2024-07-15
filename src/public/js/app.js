const socket = io();//socket돌리고있는 서버를 자동으로 찾아서 연결해줌

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden=true;

let roomName;

function addMessage(message){
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText=message;
  ul.appendChild(li);
}

function showRoom(){
  welcome.hidden=true;
  room.hidden=false;
  const h3=room.querySelector("h3");
  h3.innerText=`Room:${roomName}`
}


function handleRoomSubmit(event){
  event.preventDefault();
  const input = form. querySelector("input");
  socket.emit("enter_room",input.value,showRoom);
  roomName=input.value;
  input.value="";
}

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome",()=>{
  addMessage("someone joined!");
});