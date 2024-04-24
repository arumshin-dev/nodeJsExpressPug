//front

// 'io' 함수를 호출하여 서버에 연결하는 소켓 객체를 생성합니다.
// 이 함수는 현재 웹 페이지가 로드된 서버와 자동으로 연결을 시도합니다.
const socket = io();

// 'welcome' 아이디를 가진 HTML 요소를 선택하여 welcome 변수에 저장합니다.
const welcome = document.getElementById("welcome");
// welcome 요소 내부에서 form 요소를 찾아 form 변수에 저장합니다.
const form = welcome.querySelector("form");
// 'room'이라는 아이디를 가진 HTML 요소를 선택하여 room 변수에 저장합니다.
const room = document.getElementById("room");

// room 요소를 화면에서 숨깁니다. 이는 사용자가 아직 방을 선택하지 않았을 때 방 목록이나 채팅방이 보이지 않게 하기 위함입니다.
room.hidden = true;

// roomName 변수를 선언합니다. 이 변수는 선택된 채팅방의 이름을 저장하는 데 사용될 것입니다.
let roomName;

// handleMessageSubmit 함수 정의: 폼 제출 이벤트를 처리합니다.
function handleMessageSubmit(event){
  // 폼 제출에 의한 페이지 새로고침을 방지합니다.
  event.preventDefault();

  // 'room' 요소 내에서 첫 번째 '#msg input' 요소를 찾아 input 변수에 저장합니다.
  const input = room.querySelector("#msg input");

  // input 요소의 현재 값을 value 변수에 저장합니다.
  const value = input.value;

  // 입력값을 콘솔에 출력합니다. (디버깅 목적)
  console.log(input.value);

  // socket을 통해 서버에 "new_message" 이벤트를 전송합니다.
  // 이때, 사용자가 입력한 메시지(value), 방 이름(roomName)을 함께 전송합니다.
  socket.emit("new_message", input.value, roomName, () => {
    // 서버에서 메시지를 받아 처리한 후 호출되는 콜백 함수입니다.
    // 채팅창에 사용자 자신의 메시지를 "You: <메시지>" 형태로 추가합니다.
    addMessage(`You: ${value}`);
  });

  // 메시지 전송 후 입력 필드를 비웁니다.
  input.value = "";
}

// handleNicknameSubmit 함수 정의: 폼 제출 이벤트를 처리합니다.
function handleNicknameSubmit(event) {
  // 폼 제출에 의한 페이지 새로고침을 방지합니다.
  event.preventDefault();
  // 'room' 요소 내에서 첫 번째 '#name input' 요소를 찾아 input 변수에 저장합니다.
  const input = room.querySelector("#name input");
  // socket을 통해 서버에 "nickname" 이벤트를 전송합니다.
  // 이때, 사용자가 입력한 닉네임(value)을 함께 전송합니다.
  socket.emit("nickname", input.value);
}

// showRoom 함수를 정의합니다. 이 함수는 채팅방을 화면에 표시하는 데 사용됩니다.
function showRoom(){
  // welcome 요소를 화면에서 숨깁니다. 이는 사용자가 방을 선택하면 초기 환영 메시지나 방 선택 화면을 숨기기 위함입니다.
  welcome.hidden = true;
  // room 요소를 화면에 표시합니다. 이는 사용자가 방을 선택하면 해당 방의 채팅 인터페이스를 보여주기 위함입니다.
  room.hidden = false;
  // room 요소 내부에서 첫 번째 h3 태그를 선택합니다.
  const h3 = room.querySelector("h3");
  // h3 요소의 텍스트를 "Room "과 선택된 방의 이름(roomName)을 결합한 문자열로 설정합니다.
  // 이는 사용자가 어떤 방에 있는지를 명시적으로 보여주기 위함입니다.
  h3.innerText = `Room ${roomName}`;
  // 'room' 요소 내에서 '#msg' 태그를 찾아 msgForm 변수에 저장합니다.
  const msgForm = room.querySelector("#msg");
  // 'room' 요소 내에서 '#name' 태그를 찾아 nameForm 변수에 저장합니다.
  const nameForm = room.querySelector("#name");
  // msgForm 요소에 'submit' 이벤트 리스너를 추가합니다.
  // 이 이벤트는 사용자가 폼을 제출할 때마다 실행됩니다.
  msgForm.addEventListener("submit", handleMessageSubmit);
  // nameForm 요소에 'submit' 이벤트 리스너를 추가합니다.
  // 이 이벤트는 사용자가 폼을 제출할 때마다 실행됩니다.
  nameForm.addEventListener("submit", handleNicknameSubmit);
}


// 폼 제출 이벤트를 처리하는 handleRoomSubmit 함수를 정의합니다.
function handleRoomSubmit(event) {
  // 폼 제출에 의한 페이지 새로고침을 방지합니다.
  event.preventDefault();
  // form 요소 내의 input 요소를 찾아 input 변수에 저장합니다.
  const input = form.querySelector("input");
  // 소켓을 통해 "enter_room" 이벤트를 서버로 전송하고, 서버로부터 응답을 받으면 콜백 함수를 실행합니다.
  // input.value는 사용자가 입력한 방 이름 또는 데이터를 payload로 서버에 전송합니다.
  socket.emit("enter_room", {payload:input.value}, showRoom);
  // input 요소의 현재 값(value)을 roomName 변수에 할당합니다.
  // 이는 사용자가 입력한 텍스트를 채팅방 이름으로 사용하기 위해 저장하는 과정입니다.
  roomName = input.value;

  // 메시지 전송 후 입력 필드를 비웁니다.
  input.value = "";
}

// form 요소에 'submit' 이벤트 리스너를 추가합니다. 제출 이벤트가 발생하면 handleRoomSubmit 함수가 호출됩니다.
form.addEventListener("submit", handleRoomSubmit);

// addMessage 함수를 정의합니다. 이 함수는 메시지 문자열을 매개변수로 받아 처리합니다.
function addMessage(message){
  // 'room' 요소 내부에서 'ul' 태그를 찾아 ul 변수에 저장합니다.
  const ul = room.querySelector("ul");
  // 새로운 'li' 요소를 생성합니다.
  const li = document.createElement("li");
  // 생성된 'li' 요소의 텍스트 내용으로 매개변수로 받은 message를 설정합니다.
  li.innerText = message;
  // ul 요소의 자식 요소로 생성된 li를 추가합니다. 이는 메시지 목록에 새 메시지를 표시합니다.
  ul.appendChild(li);
}

// socket 객체에 'welcome' 이벤트 리스너를 추가합니다.
// 이 이벤트는 서버로부터 'welcome' 신호를 받았을 때 실행됩니다.
socket.on("welcome", (user) => {
  // 'welcome' 이벤트가 발생하면 "사용자명 joined!"라는 메시지를 addMessage 함수를 사용하여 화면에 표시합니다.
  addMessage(`${user} arrived!`);
});

// 'bye' 이벤트를 수신하면 실행될 함수를 등록합니다.
// 이 이벤트는 채팅방에서 누군가가 나갈 때 발생합니다.
socket.on("bye", (left) => {
  // "사용자명 left! ㅠㅠ" 메시지를 채팅 화면에 추가하는 addMessage 함수를 호출합니다.
  // 이 메시지는 채팅방을 나간 사실을 다른 사용자들에게 알립니다.
  addMessage(`${left} left! ㅠㅠ`);
});

// 'new_message' 이벤트를 수신하면 실행될 함수를 등록합니다.
// 이 이벤트는 채팅방에서 새로운 메시지가 도착했을 때 발생합니다.
socket.on("new_message", addMessage);
/*
const socket = new WebSocket(`wss://${window.location.host}`);
const messageList = document.querySelector("ul");
const messageForm = document.querySelector('#message');
const nickForm = document.querySelector('#nick');

// makeMessage 함수 정의: 메시지 유형과 페이로드(데이터)를 매개변수로 받습니다.
function makeMessage(type, payload) {
  // msg 객체를 생성합니다. 이 객체는 type과 payload 프로퍼티를 포함합니다.
  // 여기서, 객체 리터럴의 프로퍼티 축약 형식을 사용하여 {type: type, payload: payload}를 {type, payload}로 간단히 표현합니다.
  const msg = {type, payload};

  // JSON.stringify 메서드를 사용하여 msg 객체를 JSON 형식의 문자열로 변환합니다.
  // 이 문자열은 네트워크를 통해 송수신하기 적합한 형태로 데이터를 직렬화합니다.
  return JSON.stringify(msg); 
}

function handleOpen(){
  console.log("Connected to Server ✅");
}

socket.addEventListener("open", handleOpen);

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () =>{
  console.log("Disconnected to Server ❌");
});

// setTimeout(() => {
//   socket.send("hello from the browser!!");
// }, 10000);

//메세지form submit시 실행되는 함수
function haandleSubmit(event){
  // 기본 이벤트 동작을 막습니다. 여기서는 폼 제출 시 페이지 새로고침을 막습니다.
  event.preventDefault();
  // messageForm 내부의 "input" 요소를 선택하여 input 변수에 저장합니다.
  const input = messageForm.querySelector("input");
  // 소켓을 통해 서버로 메시지를 보냅니다. makeMessage 함수를 사용하여 "new_message" 유형과 입력 필드의 값을 포함하는 메시지 객체를 생성합니다.
  socket.send(makeMessage("new_message",input.value));
  //li 객체 js에서 생성
  const li = document.createElement("li");
  //li에 내가 보내는 메세지 담기
  li.innerText = `You: ${input.value}`;
  //ul에 추가하기
  messageList.append(li);
  // 콘솔에 입력 필드의 값을 출력합니다. 디버깅 목적으로 사용됩니다.
  console.log(input.value);
  // 입력 필드를 비웁니다. 메시지 전송 후 입력 필드를 초기화하여 다음 메시지를 입력받을 준비를 합니다.
  input.value='';
}

//닉네임form submit시 실행되는 함수
function handleNickSubmit(event) {  
  // 기본 이벤트 동작을 막습니다. 여기서는 폼 제출 시 페이지 새로고침을 막습니다.
  event.preventDefault();
  // nickForm 내부의 "input" 요소를 선택하여 input 변수에 저장합니다.
  const input = nickForm.querySelector('input');
  // 소켓을 통해 서버로 메시지를 보냅니다. makeMessage 함수를 사용하여 "nickname" 유형과 입력 필드의 값을 포함하는 메시지 객체를 생성합니다.
  socket.send(makeMessage("nickname",input.value));
  // 입력 필드를 비웁니다. 메시지 전송 후 입력 필드를 초기화하여 다음 메시지를 입력받을 준비를 합니다.
  input.value='';
}
//메세지form에서 submit 동작이 일어날 때 실행
messageForm.addEventListener("submit", haandleSubmit);
//닉네임form에서 submit 동작이 일어날 때 실행
nickForm.addEventListener("submit", handleNickSubmit);
*/