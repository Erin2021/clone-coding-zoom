// const socket = new WebSocket("http://localhost:3000");//socekt사용에 http프로토콜 입력당해서=>웹소켓프로토콜이용해야하거든
const socket = new WebSocket(`ws://${window.location.host}`);//localhost:3000 http=>ws로 변경 window.location.host=>접속장소호스트변환


socket.addEventListener("open",()=>{
    console.log("Connected to Server");
})

socket.addEventListener("message",(message)=>{
    console.log("Just got this:",message.data,"from the server");
})

socket.addEventListener("close",()=>{
    console.log("Disconnected from server");
})

setTimeout(()=>{
    socket.send("hello from browser!");
},5000);