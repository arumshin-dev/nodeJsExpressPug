// HTTP 모듈을 임포트합니다. 이 모듈은 Node.js의 내장 모듈로서 HTTP 서버를 생성하는 데 사용됩니다.
import http from "http";

// Socket.IO 라이브러리를 임포트합니다. 이 라이브러리는 웹소켓 기능을 제공하여 실시간, 양방향 통신을 가능하게 합니다.
import SocketIO from "socket.io";

// Express 모듈을 임포트합니다. Express는 Node.js를 위한 미니멀하고 유연한 웹 애플리케이션 프레임워크입니다.
import express from "express";

// Express 애플리케이션 객체를 생성합니다.
const app = express();

// Pug 엔진을 사용하여 뷰를 렌더링하기 위한 설정을 합니다. Pug는 템플릿 엔진으로 HTML을 보다 간편하게 작성할 수 있게 돕습니다.
app.set("view engine", "pug");

// Pug 템플릿 파일들이 위치할 경로를 설정합니다.
app.set("views", __dirname + "/views");

// 정적 파일(예: 스타일시트, 스크립트, 이미지 등)을 제공하기 위한 미들웨어를 설정합니다. 이 경로에 있는 파일들은 클라이언트에게 직접 접근 가능합니다.
app.use("/public", express.static(__dirname + "/public"));

// 루트 URL ('/')에 대한 GET 요청을 처리합니다. 요청이 들어오면 'homeVideo'라는 이름의 Pug 템플릿을 렌더링하여 반환합니다.
app.get("/", (req, res) => res.render("homeVideo"));

// 정의되지 않은 모든 경로에 대해 루트 URL로 리다이렉트합니다.
app.get("/*", (req, res) => res.redirect("/"));

// HTTP 서버를 생성하고, 이 서버를 통해 Express 앱을 실행합니다.
const httpServer = http.createServer(app);
// 생성된 HTTP 서버 위에 WebSocket 서버를 구축합니다. 이렇게 함으로써 HTTP와 WebSocket 요청을 동일한 포트에서 처리할 수 있습니다.
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) =>{
  socket.on("join_room", (roomName) =>{
    socket.join(roomName);
  })
})

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});