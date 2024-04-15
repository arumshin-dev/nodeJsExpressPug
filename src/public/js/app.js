//front
const socket = new WebSocket(`wss://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");

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

// setTimeout(() => {
//   socket.send("hello from the browser!!");
// }, 10000);

function haandleSubmit(event){
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(input.value);
  console.log(input.value);
  input.value='';
}

messageForm.addEventListener("submit", haandleSubmit);