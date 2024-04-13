module.exports = {
  // src/public 디렉토리 내 파일 변화는 무시됩니다.
  ignore: ["src/public/*"],
  // exec 명령은 babel-node를 사용하여 src/server.js를 실행합니다.
  exec: "babel-node src/server.js"
};
