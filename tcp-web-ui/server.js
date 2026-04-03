const net = require("net");
const WebSocket = require("ws");
const express = require("express");

const app = express();
const PORT = 3000;

// Serve frontend
app.use(express.static("public"));

const server = app.listen(PORT,"0.0.0.0", () => {
    console.log("Web UI running on http://localhost:3000");
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// Connect to your C++ TCP server
const tcpClient = new net.Socket();

tcpClient.connect(54000, "127.0.0.1", () => {
    console.log("Connected to C++ TCP server");
});

// Receive from C++ → send to browser
tcpClient.on("data", (data) => {
    const message = data.toString();
    console.log("From C++:", message);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
});

// Receive from browser → send to C++
wss.on("connection", (ws) => {
    console.log("Browser connected");

    ws.on("message", (msg) => {
        tcpClient.write(msg.toString());
    });
});
