// HTTP와 WebSocket 모듈 가져오기
import http from "http";

//socket.io 모듈 가져오기 http://localhost:3000/socket.io/socket.io.js
import {Server} from "socket.io";
import {instrument} from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

// publicRooms 함수 정의: 현재 서버에 존재하는 공개 채팅방 목록을 반환합니다.
function publicRooms() {
  // wsServer 객체에서 sockets의 adapter 객체를 구조 분해하여,
  // sids와 rooms 맵을 추출합니다.
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  // 공개 채팅방들을 저장할 배열을 초기화합니다.
  const publicRooms = [];

  // 모든 방에 대해 반복을 수행합니다.
  // rooms 맵에서 각 방의 키(key)와 값을 무시하고 순회합니다.
  rooms.forEach((_, key) => {
    // sids 맵에 방 이름(key)이 없는 경우, 이는 공개 채팅방임을 의미합니다.
    // Socket.IO에서 각 소켓의 ID는 sids 맵에 저장되며, 각 방은 rooms 맵에 저장됩니다.
    // 소켓 ID 대신 방 이름이 키로 사용되는 경우, 해당 방에는 아무도 참여하지 않았다는 의미가 됩니다.
    if (sids.get(key) === undefined) {
      // 공개 채팅방 배열에 현재 검사중인 방 이름을 추가합니다.
      publicRooms.push(key);
    }
  });

  // 공개 채팅방 목록을 반환합니다.
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size || 0;
}

function countAll() {
  const adapter = wsServer.sockets.adapter;

  // 전체 접속자 수: 모든 소켓의 개수
  const total = adapter.sids.size;

  // 방 개수 및 각 방에 있는 사람 수
  const roomsInfo = {};
  adapter.rooms.forEach((sockets, roomName) => {
    // 각 방에 소켓 ID가 방 이름과 동일하지 않으면, 그 방은 실제 채팅방입니다.
    if (sockets.size > 0 && adapter.sids.has(roomName) === false) {
      roomsInfo[roomName] = sockets.size;
    }
  });

  // 대기 접속자 수 계산: 방에 속하지 않은 소켓의 수
  let out = 0;
  adapter.sids.forEach((rooms, socketId) => {
    if (rooms.size === 1) { // 소켓이 자신의 ID로된 방에만 속해 있다면, 대기 중으로 간주
      out++;
    }
  });

  // 결과 객체 구성
  var test = {
    total: total, // 전체 접속자 수
    rooms: roomsInfo, // 각 방의 이름과 그 방의 소켓 수
    out: out // 대기 중인 소켓 수
  };

  return test;
}

function updateStatus() {
  const status = countAll();

  // 방 정보에서 각 방의 이름과 인원 수를 문자열로 변환합니다.
  const roomsDetail = Object.entries(status.rooms).map(([roomName, count]) => `${roomName} (${count})`);
  
  wsServer.sockets.emit("status_update", {
    total: status.total,
    rooms: Object.keys(status.rooms).length,
    out: status.out,
    roomDetail: roomsDetail,
  });
}

// WebSocket 서버의 'connection' 이벤트 리스너를 설정합니다.
// 이 이벤트는 클라이언트가 서버에 연결될 때마다 트리거됩니다.
wsServer.on("connection", (socket) => {

  updateStatus(); // 접속할 때 상태 업데이트
  
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
    // 방 이름이 객체로 전달되는 경우와 문자열로 전달되는 경우를 모두 처리
    const room = typeof roomName === 'object' && roomName.payload ? roomName.payload : roomName;

    // 방에 조인
    socket.join(room);
    // 클라이언트 소켓을 지정된 방 이름에 해당하는 방에 조인시킵니다.
    // Socket.IO의 join 메소드를 사용하여 해당 방에 소켓을 추가합니다.
    // socket.join(roomName.payload);
    // console.log(roomName.payload);
    // 소켓에서 전달된 닉네임(nickname)을 해당 소켓의 "nickname" 속성에 저장합니다.
    socket["nickname"] = roomName.nickname;
    // 클라이언트에게 작업이 완료되었음을 알리기 위해 콜백 함수(done)를 호출합니다.
    // 클라이언트가 제공한 이 콜백 함수는 서버의 작업이 완료된 후 클라이언트 측에서 특정 행동을 하도록 할 수 있습니다.
    // 방 입장 완료 후 클라이언트에 콜백 호출
    done(countRoom(room));
    // done(countRoom(roomName.payload));

    // 서버에서 특정 채팅방(roomName.payload)의 모든 클라이언트에게 'welcome' 이벤트를 방송합니다.
    // 이 방송은 메시지를 보낸 클라이언트를 제외한 모든 클라이언트에게 전송됩니다.
    socket.to(room).emit("welcome", socket.nickname, countRoom(room));
    // socket.to(roomName.payload).emit("welcome", socket.nickname, countRoom(roomName.payload));
    // "room_change" 이벤트를 서버에 연결된 모든 소켓(클라이언트)에게 전송합니다.
    // 이 이벤트는 publicRooms() 함수를 호출하여 얻은 공개 채팅방 목록 배열을 보냅니다.
    wsServer.sockets.emit("room_change", publicRooms());

    updateStatus(); // 방 상태 업데이트
  });

  // 클라이언트가 연결을 끊기 직전에 발생하는 'disconnecting' 이벤트를 리스닝합니다.
  socket.on("disconnecting", () => {
    // 클라이언트가 현재 속해 있는 모든 방을 순회합니다.
    socket.rooms.forEach((room) => {
      // 해당 방에 있는 다른 클라이언트들에게 'bye' 이벤트를 방송합니다.
      // 이는 현재 클라이언트가 방을 떠나고 있음을 알리는 신호입니다.
      socket.to(room).emit("bye", socket.nickname, countRoom(room)-1);
    });
  });

  // 'disconnect' 이벤트를 리스닝합니다. 클라이언트가 연결을 해제할 때 이 이벤트가 발생합니다.
  socket.on("disconnect", () => {
    // 클라이언트가 서버에서 연결을 해제하면, 서버에 연결된 모든 소켓(클라이언트)에게 'room_change' 이벤트를 전송합니다.
    // 이 이벤트에는 현재 공개적으로 접근 가능한 채팅방의 목록을 포함합니다. 이 목록은 publicRooms() 함수를 호출함으로써 얻어집니다.
    wsServer.sockets.emit("room_change", publicRooms());

    updateStatus(); // 접속 해제 시 상태 업데이트
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

// 서버를 포트 3000에서 시작
httpServer.listen(3000, handleListen);
