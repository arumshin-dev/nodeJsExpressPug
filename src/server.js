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

function publicRooms() {
  const {sockets: {adapter: { sids, rooms }}} = wsServer;
//  const sids = wsServer.adapter.sids;
//  const rooms = wsServer.adapter.rooms;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if(sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  })
  return publicRooms;
}

// WebSocket 서버의 'connection' 이벤트 리스너를 설정합니다. 
// 이 이벤트는 클라이언트가 서버에 연결될 때마다 트리거됩니다.
wsServer.on("connection", socket => {
  // 새로 연결된 소켓에 기본적으로 "Anon"이라는 닉네임을 할당합니다.
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
    // 소켓에서 전달된 닉네임(nickname)을 해당 소켓의 "nickname" 속성에 저장합니다.
    socket["nickname"] = roomName.nickname;
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
    // 'nickname' 이벤트를 리스닝합니다.
    // 소켓에서 전달된 닉네임(nickname)을 해당 소켓의 "nickname" 속성에 저장합니다.
    socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
  });
});

// 서버를 포트 3000에서 시작
httpServer.listen(3000, handleListen);
