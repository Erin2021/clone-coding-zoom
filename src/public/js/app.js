const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);//backend 연결

function makeMessage(type,payload){
  const msg={type,payload};
  return JSON.stringify(msg);
}

socket.addEventListener("open",()=>{
  console.log("connected to Server👽")
})

socket.addEventListener("message",(message)=>{
  //console.log("New message: ",message.data);
  const li = document.createElement('li');
  li.innerText=message.data;
  messageList.append(li);
})

socket.addEventListener("close",()=>{
  console.log("Disconnected to Server👾")
})

// setTimeout(()=>{
//   socket.send("hello from the browser!");
// },10000);//10초후에 backend로 메세지 보내기

function handleSubmit(event){
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message",input.value));
  const li = document.createElement('li');
  li.innerText=`You : ${input.value}`;
  messageList.append(li);
  input.value="";
}

function handleNickSubmit(event){
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname",input.value));
  input.value="";
}

messageForm.addEventListener("submit",handleSubmit);
nickForm.addEventListener("submit",handleNickSubmit);