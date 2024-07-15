import http from "http";
import WebSocket from "ws";
import express, { application } from "express";

const app =express();

console.log('helo');

app.set("view engine","pug");
app.set("views",__dirname +"/views");

app.use('/public',express.static(__dirname+"/public"));//유저가 볼수 있는 파일설정


app.get("/",(req,res)=>res.render("home"));
app.get("/*",(req,res)=>res.redirect("/"));//catchall url


const handleListen =() => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);



//불필요해 보이지만 websocket사용하려면 필요한과정임.
const server = http.createServer(app);//http서버생성.서버에접근할 수 있게됨

const wss = new WebSocket.Server({server});//wss서버생성. 이렇게 해야 http서버와 wss서버 둘다 돌릴 수 있음.인자에 아무것도 안적으면 wss혼자 돌아감

wss.on("connection",(socket)=>{//누가 연결시 발생.socket:연결된 어떤 사람
  //console.log(socket);
  console.log("connected to Browser👽")
  socket.on("close",()=>console.log("Disconnected to Browser👾"));
  socket.on("message",(message)=>{
    console.log(message.toString());
  });
  socket.send('helo!')
  
});

server.listen(3000, handleListen);
