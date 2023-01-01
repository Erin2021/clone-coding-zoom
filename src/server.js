import http from "http";
// import WebSocket from "ws";
// import SocketIO from "socket.io";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";


const app= express();

//views받아오기
app.set("view engine","pug");
app.set("views",__dirname+"/views");

//뷰에서 스크립트 쓰기위해 서버에서부터 받아오기
app.use("/public", express.static(__dirname + "/public"));

app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/*",(req,res)=>{
    res.redirect("/");
});

const httpServer=http.createServer(app);//http서버
// const wsServer=SocketIO(httpServer);//ws서버
const wsServer=new Server(httpServer,{
    cors: {
        origin:"https://admin.socket.io",//내부객체,네 개인서버있다면 그 주소 넣어도 오케이
        credentials : true
    }
});



instrument(wsServer,{
    auth:false
});//서버 비밀번호 사용가능하도록 auth:false;
// const server = http.createServer(app);//http서버
// const wss = new WebSocket.Server({server});//websocket

// //유저 db
// const sockets=[];

// wss.on("connection",(socket)=>{
//     // console.log(socket);
//     sockets.push(socket);//접속될때마다 들어오는 socket유저 저장
//     socket["nickname"] = "Anonymous";//익명사용자.초기접속시
//     console.log("Connected to Browser");
//     socket.on("close",()=>{
//         console.log("Disconnected from Browser");
//     })
//     socket.on("message",(msg)=>{
//         const message = JSON.parse(msg);//json를 js객체화=>.으로 검색가능 
//         // console.log(message.type , message.payload);
//         // sockets.forEach(aSocket=>aSocket.send(`${msg}`));//user하나씩 만나서 메세지보내기 forEach(function)
//         switch(message.type){
//             case "new_message" :
//                 sockets.forEach(aSocket=>aSocket.send(`${socket.nickname}:${message.payload}`));
//                 break;
//             case "nickname" :
//                 socket["nickname"] =message.payload;//socket에 닉네임정보 추가
//                 break;
//         }
//     })
//     // socket.send("hello!");
// })

function publicRooms(){
    // const sids = wsServer.sockets.adapter.sids;
    // const rooms = wsServer.sockets.adapter.rooms;
    //구조분해할당
    const {
        sockets:{
             adapter:{sids,rooms},
            },
        } = wsServer;

    const publicRooms=[];
    rooms.forEach((_,key)=>{//sids와 일치X => public
        console.log(rooms);
        if(sids.get(key)===undefined){
            publicRooms.push(key);
        }
    })
    return publicRooms;
}

function countRoom(roomName){
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;//rooms에서 roomName을 가져온다. ?연산자:roomName이 있을시,size 가져온다.
}

wsServer.on("connection",(socket)=>{
    socket["nickname"]="Anon";//초반 js맵에 nickname:anon 으로 설정
    socket.onAny((event)=>{//socket이벤트발생할때마다 발싸
        console.log(wsServer.sockets.adapter);
        console.log(`Socket Event : ${event}`)
    })
    socket.on("enter_room",(roomName,done)=>{
        done();
        //console.log(socket.id);
        socket.join(roomName);//방들어가기
        //console.log(socket.rooms)
        socket.to(roomName).emit("welcome",socket.nickname,countRoom(roomName));//같은방유저에게 welcome함수+들어온유저닉네임발싸
        wsServer.sockets.emit("room_change",publicRooms());//방들어올때마다 어떤방이 있는지 모두에게 알려줌
    })
    //dosconnect:연결해제 될때 이벤트 , disconnecting:연결해제 직전 이벤트
    socket.on("disconnecting",()=>{
        socket.rooms.forEach(room=>socket.to(room).emit("bye",socket.nickname,countRoom(room)-1));//.rooms 셋에서 만나는 모든 방정보 room에다 넣고, 그 room에 만나는 유저에게 bye발싸
    })

    socket.on("disconnect",()=>{//채팅룸사라질조건:사용전연결해제=>disconnect
        wsServer.sockets.emit("room_change",publicRooms());
    })

    socket.on("new_message",(msg, room, done)=>{
        socket.to(room).emit("new_message",`${socket.nickname} : ${msg}`);//나제외한 room에있는 사람에게 메세지
        done();
    })

    socket.on("nickname",(nickname)=>{
        socket["nickname"]=nickname;
    })
})
const handleListen =()=>{
    console.log("Listeing on http://localhost:3000");
}
httpServer.listen(3000,handleListen);