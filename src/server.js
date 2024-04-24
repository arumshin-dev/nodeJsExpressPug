// HTTP와 WebSocket 모듈 가져오기
import http from 'http';

//socket.io 모듈 가져오기 http://localhost:3000/socket.io/socket.io.js
import SocketIO from 'socket.io';
/*
import webSocket from 'ws';
*/
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
const httpServer = http.createServer(app);
// Socket.IO 라이브러리를 사용하여 httpServer를 기반으로 새 WebSocket 서버(wsServer) 인스턴스를 생성합니다.
const wsServer = SocketIO(httpServer);

// WebSocket 서버의 'connection' 이벤트 리스너를 설정합니다. 
// 이 이벤트는 클라이언트가 서버에 연결될 때마다 트리거됩니다.
wsServer.on("connection", socket => {
  socket["nickname"] = "Anon";
  // 클라이언트와 연결된 소켓에서 발생하는 모든 이벤트를 감지하고,
  // 해당 이벤트의 이름을 콘솔에 로그합니다.
  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  // 'enter_room' 이벤트 리스너를 설정합니다.
  // 클라이언트가 채팅방에 들어가고자 할 때 이 이벤트가 발생합니다.
  socket.on("enter_room", (roomName, done) => {
    // 클라이언트 소켓을 지정된 방 이름에 해당하는 방에 조인시킵니다.
    // Socket.IO의 join 메소드를 사용하여 해당 방에 소켓을 추가합니다.
    socket.join(roomName.payload);
    console.log(roomName.payload);

    // 클라이언트에게 작업이 완료되었음을 알리기 위해 콜백 함수(done)를 호출합니다.
    // 클라이언트가 제공한 이 콜백 함수는 서버의 작업이 완료된 후 클라이언트 측에서 특정 행동을 하도록 할 수 있습니다.
    done();

    // 서버에서 특정 채팅방(roomName.payload)의 모든 클라이언트에게 'welcome' 이벤트를 방송합니다.
    // 이 방송은 메시지를 보낸 클라이언트를 제외한 모든 클라이언트에게 전송됩니다.
    socket.to(roomName.payload).emit("welcome", socket.nickname);
    // 클라이언트가 연결을 끊기 직전에 발생하는 'disconnecting' 이벤트를 리스닝합니다.
    socket.on("disconnecting", () => {
      // 클라이언트가 현재 속해 있는 모든 방을 순회합니다.
      socket.rooms.forEach((room) => {
        // 해당 방에 있는 다른 클라이언트들에게 'bye' 이벤트를 방송합니다.
        // 이는 현재 클라이언트가 방을 떠나고 있음을 알리는 신호입니다.
        socket.to(room).emit("bye", socket.nickname);
      });
    });

    // 'new_message' 이벤트를 리스닝합니다.
    // 이 이벤트는 사용자가 새 메시지를 보냈을 때 서버에 전달됩니다.
    socket.on("new_message", (msg, room, done) => {
      // 전달받은 메시지(msg)를 같은 방(room)에 있는 다른 클라이언트들에게 전송합니다.
      socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
      // 클라이언트가 제공한 콜백 함수(done)를 호출하여,
      // 메시지 전송이 성공적으로 처리되었음을 클라이언트에 알립니다.
      done();
    });
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  });
});

/*
// WebSocket 서버를 HTTP 서버와 함께 초기화
const wss = new webSocket.Server({ server });

// onSocketClose 함수 정의: 특별한 매개변수는 받지 않습니다.
function onSocketClose() {
  // 콘솔에 "Disconnected from the Browser ❌" 메시지를 출력합니다.
  // 이 로그는 웹소켓 연결이 끊겼을 때 서버 콘솔에 표시되어, 연결 상태를 모니터링하는데 도움을 줍니다.
  console.log("Disconnected from the Browser ❌");
}

// 'sockets'라는 이름의 빈 배열을 생성합니다. 
// 이 배열은 웹소켓 연결들을 저장하는 용도로 사용됩니다.
// 각 웹소켓 연결이 열릴 때마다 이 배열에 소켓 객체가 추가됩니다.
const sockets = [];

// handleConnection 함수 정의: 웹소켓 연결 객체(socket)를 매개변수로 받습니다.
function handleConnection(socket){
  // 연결된 소켓을 sockets 배열에 추가합니다.
  sockets.push(socket);
  // 새로 연결된 소켓에 기본적으로 "Anon"이라는 닉네임을 할당합니다.
  socket["nickname"] = "Anon";
  // 콘솔에 연결 성공 메시지를 출력합니다.
  console.log("Connected to Browser ✅");
  // 소켓이 닫힐 때 실행될 함수(onSocketClose)를 등록합니다.
  socket.on("close", onSocketClose);
  // 소켓에서 메시지를 받았을 때의 처리를 정의합니다.
  socket.on("message", (msg) => {
    // 받은 메시지(msg)를 JSON 객체로 파싱합니다.
    const message = JSON.parse(msg);
    // 메시지 유형에 따라 적절한 조치를 취합니다.
    switch (message.type) {
      // 새 메시지를 받았을 경우
      case "new_message":
        // 모든 연결된 소켓(sockets 배열의 각 aSocket)에게 이 메시지를 전송합니다.
        // 메시지 포맷: "<닉네임>: <메시지 내용>"
        //filter 조건으로 동일한 소켓 객체인지 확인. 
        //aSocket은 메세지를 보낼때 같이 온 소켓이며, socket은 커넥션에 성공했을때 생성된 객체
        sockets.filter((aSocket) => aSocket !== socket).forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`));
        //sockets.forEach(aSocket => aSocket.send(`${socket.nickname} : ${message.payload}`));
        break; // switch 문에서 break를 빠트리면 다음 case로 계속 진행됩니다.
      // 닉네임 설정 메시지를 받았을 경우
      case "nickname":
        // 메시지에서 전달된 닉네임(payload)을 해당 소켓의 "nickname" 속성에 저장합니다.
        socket["nickname"] = message.payload;
        break; // 각 case마다 break를 추가하여 명확하게 처리 구분을 해줘야 합니다.
    }
  });
}

// WebSocket 서버에 연결 이벤트 리스너 등록
wss.on("connection", handleConnection);
*/

// 서버를 포트 3000에서 시작
httpServer.listen(3000, handleListen);
