import http from 'http';
import webSocket from 'ws';
import express from "express";

const app = express();

//console.log("hello");
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req,res) => res.render("home"));
app.get("/*", (req,res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on http://localhost:3000`)
//app.listen(3000,handleListen);
//#npm run dev 
//shell 에서 실행하면 hello 콘솔 확인
//#1.2
const server = http.createServer(app);
const wss = new webSocket.Server({server});

//#1.3
function handleConnection(socket){
  console.log(socket);
}

wss.on("connection",handleConnection);

server.listen(3000,handleListen);

