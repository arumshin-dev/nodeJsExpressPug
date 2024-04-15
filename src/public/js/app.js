//front
const socket = new WebSocket(`wss://${window.location.host}`);

function handleOpen(){
  console.log("Connected to Server ✅");
}

socket.addEventListener("open", handleOpen);

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

socket.addEventListener("close", () =>{
  console.log("Disconnected to Server ❌");
});

setTimeout(() => {
  socket.send("hello from the browser!!");
}, 10000);