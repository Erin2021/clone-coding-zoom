import http from "http";
// import WebSocket from "ws";
import SocketIO from "socket.io";
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
const wsServer=SocketIO(httpServer);//ws서버
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

wsServer.on("connection",(socket)=>{
    socket.on("enter_room",(roomName,done)=>{
        done();
        console.log(roomName);
        console.log(socket.id);
        socket.join(roomName);//방들어가기
        console.log(socket.rooms)
        socket.to(roomName).emit("welcome");//같은방유저에게 welcome함수발싸
    })

    socket.on("disconnecting",()=>{
        socket.rooms.forEach(room=>socket.to(room).emit("bye"));//.rooms 셋에서 만나는 모든 방정보 room에다 넣고, 그 room에 만나는 유저에게 bye발싸
    })

    socket.on("new_message",(msg, room, done)=>{
        socket.to(room).emit("new_message",msg);
        done();
    })
})
const handleListen =()=>{
    console.log("Listeing on http://localhost:3000");
}
httpServer.listen(3000,handleListen);