// HTTP와 WebSocket 모듈 가져오기
import http from 'http';
import webSocket from 'ws';

// Express 모듈 가져오기
import express from "express";

// Express 애플리케이션 초기화
const app = express();

// Pug 템플릿 엔진을 설정
app.set("view engine", "pug");
// Pug 템플릿 파일의 위치를 설정
app.set("views", __dirname + "/views");

// '/public' 경로로 정적 파일 제공
app.use("/public", express.static(__dirname + "/public"));

// 루트 경로에 접근 시 home.pug 렌더링
app.get("/", (req, res) => res.render("home"));

// 정의되지 않은 모든 경로를 루트로 리다이렉트
app.get("/*", (req, res) => res.redirect("/"));

// 서버가 시작될 때 콘솔에 메시지 출력
const handleListen = () => console.log(`Listening on http://localhost:3000`);

// HTTP 서버를 Express 앱과 함께 생성
const server = http.createServer(app);

// WebSocket 서버를 HTTP 서버와 함께 초기화
const wss = new webSocket.Server({ server });

function onSocketClose() {
  console.log("Disconnected from the Browser ❌")
};

function onSocketMessage(message) {
  // console.log(message.toString('utf8'));
  console.log(message.toString());
  socket.send(message);
};

// WebSocket 연결이 발생할 때 실행될 함수
function handleConnection(socket){
  //console.log(socket);
  //back
  console.log("Connected to Browser ✅");
  socket.on("close", onSocketClose);
  socket.on("message", (message)=>{
   socket.send(message.toString());
  });
  // socket.send("hello!!");
}

// WebSocket 서버에 연결 이벤트 리스너 등록
wss.on("connection", handleConnection);

// 서버를 포트 3000에서 시작
server.listen(3000, handleListen);
