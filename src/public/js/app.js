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
function handleMessageSubmit(event) {
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
function showRoom(newCount) {
  // welcome 요소를 화면에서 숨깁니다. 이는 사용자가 방을 선택하면 초기 환영 메시지나 방 선택 화면을 숨기기 위함입니다.
  welcome.hidden = true;
  // room 요소를 화면에 표시합니다. 이는 사용자가 방을 선택하면 해당 방의 채팅 인터페이스를 보여주기 위함입니다.
  room.hidden = false;
  // room 요소 내부에서 첫 번째 h3 태그를 선택합니다.
  const h3 = room.querySelector("h3");
  // h3 요소의 텍스트를 "Room "과 선택된 방의 이름(roomName)을 결합한 문자열로 설정합니다.
  // 이는 사용자가 어떤 방에 있는지를 명시적으로 보여주기 위함입니다.
  h3.innerText = `Room ${roomName} (${newCount})`;
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
  // form 요소 내의 #roomName 요소를 찾아 roomNameInput 변수에 저장합니다.
  const roomNameInput = form.querySelector("#roomName");
  // form 요소 내의 #nickname 요소를 찾아 nickNameInput 변수에 저장합니다.
  const nickNameInput = form.querySelector("#nickname");
  // 소켓을 통해 "enter_room" 이벤트를 서버로 전송하고, 서버로부터 응답을 받으면 콜백 함수를 실행합니다.
  // roomNameInput.value는 사용자가 입력한 방 이름 또는 데이터를 payload로 서버에 전송합니다.
  // nickNameInput.value는 사용자가 입력한 닉네임 또는 데이터를 nickname 서버에 전송합니다.
  socket.emit(
    "enter_room",
    { payload: roomNameInput.value, nickname: nickNameInput.value },
    showRoom,
  );
  // roomNameInput 요소의 현재 값(value)을 roomName 변수에 할당합니다.
  // 이는 사용자가 입력한 텍스트를 채팅방 이름으로 사용하기 위해 저장하는 과정입니다.
  roomName = roomNameInput.value;
  // room 요소 내의 #name input 요소를 찾아 changeNameInput 변수에 저장합니다.
  const changeNameInput = room.querySelector("#name input");
  // changeNameInput 요소의 현재 값(value)을 nickNameInput.value값으로 할당합니다.
  changeNameInput.value = nickNameInput.value;
  // 메시지 전송 후 입력 필드를 비웁니다.
  nickNameInput.value = "";
}

// form 요소에 'submit' 이벤트 리스너를 추가합니다. 제출 이벤트가 발생하면 handleRoomSubmit 함수가 호출됩니다.
form.addEventListener("submit", handleRoomSubmit);

// addMessage 함수를 정의합니다. 이 함수는 메시지 문자열을 매개변수로 받아 처리합니다.
function addMessage(message) {
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
socket.on("welcome", (user, newCount, total) => {
  console.log("❗", total);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  // 'welcome' 이벤트가 발생하면 "사용자명 joined!"라는 메시지를 addMessage 함수를 사용하여 화면에 표시합니다.
  addMessage(`${user} arrived!`);
});

// 'bye' 이벤트를 수신하면 실행될 함수를 등록합니다.
// 이 이벤트는 채팅방에서 누군가가 나갈 때 발생합니다.
socket.on("bye", (left, newCount, total) => {
  console.log("❗", total);
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  // "사용자명 left! ㅠㅠ" 메시지를 채팅 화면에 추가하는 addMessage 함수를 호출합니다.
  // 이 메시지는 채팅방을 나간 사실을 다른 사용자들에게 알립니다.
  addMessage(`${left} left! ㅠㅠ`);
});

// 'new_message' 이벤트를 수신하면 실행될 함수를 등록합니다.
// 이 이벤트는 채팅방에서 새로운 메시지가 도착했을 때 발생합니다.
socket.on("new_message", addMessage);

// 'room_change' 이벤트를 리스닝합니다. 이 이벤트는 채팅방 목록이 변경되었을 때 서버로부터 받습니다.
socket.on("room_change", (rooms) => {
  // 'welcome' 요소 내에서 'ul' 요소를 찾아 roomList 변수에 저장합니다.
  const roomList = welcome.querySelector("ul");

  // roomList의 내용을 초기화합니다. 새로운 방 목록을 표시하기 전에 기존 목록을 제거하기 위함입니다.
  roomList.innerHTML = "";

  // 받은 방 목록이 비어있다면 함수를 종료합니다. 즉, 표시할 방이 없으면 아무 작업도 하지 않습니다.
  if (rooms.length === 0) {
    return;
  }

  // rooms 배열을 순회하면서 각 방 이름에 대해 li 요소를 생성하고, 이를 roomList에 추가합니다.
  rooms.forEach((room) => {
    // 새로운 'li' 요소를 생성합니다.
    const li = document.createElement("li");
    // li 요소의 텍스트로 방 이름을 설정합니다.
    li.innerText = room;
    // 생성된 li 요소를 roomList의 자식 요소로 추가합니다. 이로써 사용자 인터페이스에 방 목록이 표시됩니다.
    roomList.appendChild(li);
  });

  // const roomLists = document.getElementById("roomList");
  // roomLists.innerHTML = ""; // 기존 목록 초기화
  // rooms.forEach((room) => {
  //   const li = document.createElement("li");
  //   li.innerText = room;
  //   roomLists.appendChild(li);
  // });
});

socket.on("status_update", ({ total, rooms, out, roomDetail }) => {
  document.querySelector("#status p:nth-child(1)").innerText =
    `Total Connections: ${total}`;
  document.querySelector("#status p:nth-child(2)").innerText =
    `Total Rooms: ${rooms}`;
  document.querySelector("#status p:nth-child(3)").innerText =
    `Waiting Users: ${out}`;

  // 방 목록을 업데이트
  const roomList = document.getElementById("roomList");
  roomList.innerHTML = ""; // 기존 목록 초기화
    roomDetail.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room; // 방 이름과 참여 인원 수를 표시
    li.addEventListener("click", () => {
      // socket.emit("enter_room", room.split(" (")[0]); // 괄호 전의 문자열이 방 이름
      // const roomNameInput = form.querySelector("#roomName");
      // form 요소 내의 #nickname 요소를 찾아 nickNameInput 변수에 저장합니다.
      const nickNameInput = form.querySelector("#nickname");
      // 소켓을 통해 "enter_room" 이벤트를 서버로 전송하고, 서버로부터 응답을 받으면 콜백 함수를 실행합니다.
      // roomNameInput.value는 사용자가 입력한 방 이름 또는 데이터를 payload로 서버에 전송합니다.
      // nickNameInput.value는 사용자가 입력한 닉네임 또는 데이터를 nickname 서버에 전송합니다.
      socket.emit(
        "enter_room",
        { payload: room.split(" (")[0],
         nickname: nickNameInput.value || "anonymous"
        },
        showRoom,
      );
      // roomNameInput 요소의 현재 값(value)을 roomName 변수에 할당합니다.
      // 이는 사용자가 입력한 텍스트를 채팅방 이름으로 사용하기 위해 저장하는 과정입니다.
      roomName = room.split(" (")[0];
      // room 요소 내의 #name input 요소를 찾아 changeNameInput 변수에 저장합니다.
      const changeNameInput = room.querySelector("#name input");
      // changeNameInput 요소의 현재 값(value)을 nickNameInput.value값으로 할당합니다.
      changeNameInput.value = nickNameInput.value;
      // 메시지 전송 후 입력 필드를 비웁니다.
      nickNameInput.value = "";
    });
    roomList.appendChild(li);
  });
});
