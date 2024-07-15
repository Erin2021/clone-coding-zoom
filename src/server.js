import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui"
import express, { application } from "express";

const app =express();

app.set("view engine","pug");//확장자지정
app.set("views",__dirname +"/views");//폴더경로지정

app.use('/public',express.static(__dirname+"/public"));//유저가 볼수 있는 파일설정


app.get("/",(req,res)=>res.render("home"));
app.get("/*",(req,res)=>res.redirect("/"));//catchall url


const handleListen =() => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);



const httpServer = http.createServer(app);
const wsServer =new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
instrument(wsServer, {
  auth: false,
  mode: "development",
});


function publicRooms(){
  const {sockets:{adapter:{sids, rooms}}} = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRooms(roomName){
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;//roomName 찾은다면 size도 찾아
}


wsServer.on("connection",(socket)=>{
  socket["nickname"]="Anon";
  socket.onAny((event)=>{
    // console.log(wsServer.sockets.adapter);
    console.log(`socket event:${event}`);
  })//어느 이벤트에서 작동되는지 콘솔반응함
  socket.on("enter_room",(roomName,done) =>{
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome",socket.nickname,countRooms(roomName));
    wsServer.sockets.emit("room_change",publicRooms());
  });
  socket.on("disconnecting", () => {
  
  
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname,countRooms(room)-1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("new_message",(msg,room,done)=>{
    socket.to(room).emit("new_message",`${socket.nickname}: ${msg}`);
    done();
  })
  socket.on("nickname",nickname=>{
    socket["nickname"]=nickname;
  })
});


// const wss = new WebSocket.Server({server});//wss서버생성. 이렇게 해야 http서버와 wss서버 둘다 돌릴 수 있음.인자에 아무것도 안적으면 wss혼자 돌아감
/* const sockets =[];

wss.on("connection",(socket)=>{
  sockets.push(socket);
  socket["nickname"]="Anon";
  console.log("connected to Browser👽");
  socket.on("close",()=>console.log("Disconnected to Browser👾"));
  socket.on("message",(msg)=>{
    const message = JSON.parse(msg); 
    switch(message.type){
      case "new_message":
        sockets.forEach((aSocket)=>aSocket.send(`${socket.nickname}: ${message.payload}`));
        break;
      case "nickname":
        socket["nickname"]=message.payload;
        break;
    }
  });
});
 */
httpServer.listen(3000, handleListen);