// // const socket = new WebSocket("http://localhost:3000");//socekt사용에 http프로토콜 입력당해서=>웹소켓프로토콜이용해야하거든
// const socket = new WebSocket(`ws://${window.location.host}`);//localhost:3000 http=>ws로 변경 window.location.host=>접속장소호스트변환
// const messageList = document.querySelector("ul");
// const nickForm = document.querySelector("#nick");
// const messageForm = document.querySelector("#message");

// //Json으로 만들기함수
// function makeMessage(type,payload){
//     const msg = {type, payload};
//     return JSON.stringify(msg);
// }

// socket.addEventListener("open",()=>{
//     console.log("Connected to Server");
// })

// socket.addEventListener("message",(message)=>{
//     // console.log("Just got this:",message.data,"from the server");
//     const li = document.createElement("li");
//     li.innerText = message.data;
//     messageList.append(li);
// })

// socket.addEventListener("close",()=>{
//     console.log("Disconnected from server");
// })

// // setTimeout(()=>{
// //     socket.send("hello from browser!");
// // },5000);

// function handleSubmit(event){
//     event.preventDefault();//이벤트취소메서드,이벤트가 제공하는 원래 기능 사용하지않고자할때사용=>clear out,then event
//     const input = messageForm.querySelector("input");
//     socket.send(makeMessage("new_message",input.value));
//     input.value="";
// }

// function handleNickSubmit(event){
//     event.preventDefault();
//     const input = nickForm.querySelector("input");
//     socket.send(makeMessage("nickname",input.value));
//     input.value="";
// }

// messageForm.addEventListener("submit",handleSubmit);
// nickForm.addEventListener("submit",handleNickSubmit);

const socket= io();

const welcome=document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", value, roomName,()=>{
        addMessage(`You:${value}`);
    });
    input.value ="";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    const input=room.querySelector("#name input");
    const value=input.value;
    socket.emit("nickname",value);
    input.value="";
}

function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const msgform = room.querySelector("#msg");
    const nameform = room.querySelector("#name");
    msgform.addEventListener("submit",handleMessageSubmit);
    nameform.addEventListener("submit",handleNicknameSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    // socket.emit("enter_room",input.value,()=>{//첫인자:이벤트명,두인자:서버로전송데이터,세인자:서버호출콜백함수(프->서->프)
    //     console.log("server is done!");
    // });//서버 enter_room로 방이름정보 보내기
    socket.emit("enter_room",input.value,showRoom);
    roomName =input.value;
    input.value="";
}

form.addEventListener("submit",handleRoomSubmit);

socket.on("welcome",(usernickname, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`
    addMessage(`${usernickname} arrived!`);
})
socket.on("bye",(usernickname, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`
    addMessage(`${usernickname} left ㅠㅠ`)
}) 
socket.on("new_message",(msg)=>{
    addMessage(msg);
})

socket.on("room_change",(rooms)=>{//rooms==server's publicrooms
    // console.log("현존하는방"+rooms);
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML="";//room_change 열릴때마다 리스트 초기화=>리스트중복방지
    if(rooms.length===0){//애초에 리스트==0일시,그냥 중지
        return;
    }
    rooms.forEach((rooms)=>{//publicrooms list돌려서 추가한다
        const li = document.createElement("li");
        li.innerText=rooms;
        roomList.append(li);
    })
})