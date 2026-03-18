# react-miniwireshark

A lightweight React UI for viewing and analyzing network packets — a mini Wireshark-like experience in the browser. Includes live capture views, dashboard analytics, and packet history.

## Run with Docker

**Build:**
```bash
docker build -t react-miniwireshark .
```

**Run (port 3000):**
```bash
docker run -p 3000:80 react-miniwireshark
```

Open http://localhost:3000

---

*Note: This frontend expects a backend API (default `http://localhost:8080/api`) and WebSocket server (default `http://localhost:9092`). Use build args to override for production:*
```bash
docker build --build-arg VITE_API_URL=https://your-api.com/api --build-arg VITE_SOCKET_URL=https://your-api.com -t react-miniwireshark .
```
