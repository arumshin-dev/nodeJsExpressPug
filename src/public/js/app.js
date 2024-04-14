//front
const socket = new WebSocket(`wss://${window.location.host}`);

socket.addEventListener("open", () =>{
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  console.log("Just got this: ", message.data, "from the server");
});

socket.addEventListener("close", () =>{
  console.log("Disconnected to Server ❌");
});