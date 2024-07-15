const socket = new WebSocket(`ws://${window.location.host}`);//backend 연결

socket.addEventListener("open",()=>{
  console.log("connected to Server👽")
})

socket.addEventListener("message",(message)=>{
  console.log("New message: ",message.data);
})

socket.addEventListener("close",()=>{
  console.log("Disconnected to Server👾")
})

setTimeout(()=>{
  socket.send("hello from the browser!");
},10000);//10초후에 backend로 메세지 보내기