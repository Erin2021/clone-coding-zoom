const socket = io();//socket돌리고있는 서버를 자동으로 찾아서 연결해줌

const myFace= document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const call =document.getElementById("call");

call.hidden=true;

let myStream;
let muted =false;
let cameraOff =false;
let roomName;
let myPeerConnection;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}



async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}
function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
  if(myPeerConnection){
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection.getSenders().find(sender=>sender.track.kind==="video");
    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


//Welcome Form(join a room)
const welcome =document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
  welcome.hidden=true;
  call.hidden =false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(e){
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room",input.value);
  roomName = input.value;
  input.value='';
}
welcomeForm.addEventListener("submit",handleWelcomeSubmit);


//Socket Code

//peerA
socket.on("welcome", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", (event) => console.log(event.data));
  console.log("made data channel");
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);//위치정보알려주기
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});
//peerB
socket.on("offer",async offer=>{
  myPeerConnection.addEventListener("datachannel",(event)=>{
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message",console.log);
    //메세지보내고싶을때 myDataChannel.send("hello")-> messageevent발생
  });
  console.log("receive the offer");
  myPeerConnection.setRemoteDescription(offer);//받은 A정보 정리세팅
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer",answer,roomName);
  console.log("sent the answer");
})
//peerA
socket.on("answer",answer=>{
  console.log("received the answer")
  myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice",ice=>{
  console.log("received candidate")
  myPeerConnection.addIceCandidate(ice);
})

//RTC Code
function makeConnection(){
  myPeerConnection = new RTCPeerConnection({
    iceServers:[
      {
        urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        ],
      }
    ]
  });//스턴서버
  myPeerConnection.addEventListener("icecandidate",handleIce);
  myPeerConnection.addEventListener("addstream",handleAddStream);
  myStream.getTracks().forEach(track =>myPeerConnection.addTrack(track, myStream))
}

function handleIce(data){
  console.log("sent candidate")
  socket.emit("ice",data.candidate, roomName);
  // console.log("got ICE candidate");
  // console.log(data);
}

function handleAddStream(data){
  const peersFace = document.getElementById("peerFace");
  peersFace.srcObject = data.stream;

  // console.log("got and event from my peer");
  // console.log("peer's stream:",data.stream);
  // console.log("my stream:",myStream);
}