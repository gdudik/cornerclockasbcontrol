const net = require("net");
const axios = require("axios");
const { send } = require("process");

// === Configuration ===
const TCP_PORT = 35350;

// === TCP Server Setup ===
const server = net.createServer((socket) => {
  console.log("New TCP connection established.");

  socket.on("data", async (data) => {
    const message = data.toString().trim();
    const [, rawDistance] = message.match(/distance=(\d+)/) || [];
    const distance = rawDistance ? parseInt(rawDistance, 10) : null;
    const time = message.includes("time");

    if (distance && !time) {
      await sendHttpPost("http://192.168.1.44:5833/boards/SmallTime/stop");
      await sendHttpPost("http://192.168.1.44:5833/boards/BigTime/start");

      console.log("bigTime started, smalltime stopped");
    } else if (distance > 3 && distance <= 400 && time) {
      await sendHttpPost("http://192.168.1.44:5833/boards/BigTime/stop");
      console.log("bigTime stopped");
    } else if (!(distance > 3 && distance <= 400) && time) {
      await sendHttpPost("http://192.168.1.44:5833/boards/BigTime/stop");
      await sendHttpPost("http://192.168.1.44:5833/boards/SmallTime/start");

      console.log("smallTime started");
    }
  });

  socket.on("end", () => {
    console.log("Connection closed.");
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// === HTTP POST Function ===
async function sendHttpPost(postURL) {
  axios
    .post(postURL)
    .then((response) => {
      console.log(`POST sent: ${response.status}`);
    })
    .catch((err) => {
      console.error("Failed to send POST:", err.message);
    });
}

// === Start TCP Server ===
server.listen(TCP_PORT, () => {
  console.log(`TCP server listening on port ${TCP_PORT}`);
});
