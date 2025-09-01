# Mini-Pipeline Project

## Overview
This project is a **video processing pipeline** built with Node.js and Docker.  
It consists of two services:

1. **API Service** – Handles video processing requests and triggers callbacks.  
2. **Interface Service** – Receives processed video data and displays results.

Both services are containerized using **Docker Compose**, making setup and deployment easy.

---

## Prerequisites
- Windows 10/11 with **WSL2** installed and configured  
- **Docker Desktop** installed with WSL2 integration  
- Node.js and npm (managed inside Docker containers)  

---

## Project Structure
mini-pipeline/ <br>
├── api/ # API service <br>
    ├──Dockerfile <br>
    ├──.env.example <br>
    ├──package.json <br>
    ├──server.js <br>
├── interface/ <br>
    ├──public/ <br>
        ├──style.css <br>
    ├──views <br>
        ├──guide.ejs <br>
    ├──Dockerfile <br>
    ├──index.js <br>
    ├──package.json <br>
├── docker-compose.yml <br>

---

## Setup & Run

### 1. Build and Start Services
From the project root,
run:

```bash
docker compose up --build
```

This will:

- Build Docker images for both services.

- Start containers.

- Expose ports 8000 (API) and 4000 (Interface).

### 2. Check Service Health

Verify that both services are running:
```bash
curl http://localhost:8000/health
curl http://localhost:4000/health
```

Expected response:

```bash
{"ok": true}{"ok": true}
```
### 3. Trigger the Pipeline <br>
a) File Upload-

Use PowerShell:

```bash
curl.exe -X POST http://localhost:8000/process-video `
  -H "Authorization: Bearer stepwize_test" `
  -F "video=@C:/temp/demo.mp4;type=video/mp4" `
  -F "guide_id=67" `
  -F "callback_url=http://host.docker.internal:4000/callbacks/steps"
  ```
Notes:

- host.docker.internal allows Docker containers to reach the host on Windows.

- Replace C:/temp/demo.mp4 with your local video path.

b) Remote Video URL

Trigger processing via a remote video URL:

```bash
curl -X POST http://localhost:8000/process-video \
  -H "Authorization: Bearer stepwize_test" \
  -H "Content-Type: application/json" \
  -d '{"video_url":"https://example.com/video.mp4","guide_id":67,"callback_url":"http://host.docker.internal:4000/callbacks/steps"}'
```

### 4. Verify Output

- The Interface service saves received data to 
```bash
interface/received.json
```

Open the browser at:

```bash
http://localhost:4000/guides/67
```

You should see mocked steps with titles and images.

---

## Notes:

- Ensure the video file path is correct when uploading local files.

- Docker volume mapping keeps received.json and node modules persistent between restarts.

- All API requests require the Authorization header: 
```bash
Bearer stepwize_test
```
---

Made by Neeraj Rao
---