<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0D1117,50:1A1F2E,100:0D1117&height=180&section=header&text=Douyin%20Watermark%20Remover&fontSize=38&fontColor=E6EDF3&fontAlignY=35&desc=Paste%20the%20link,%20get%20the%20original.&descSize=16&descAlignY=55&animation=fadeIn" width="100%" />

<a href="https://github.com/KkOma-value/image-video/stargazers"><img src="https://img.shields.io/github/stars/KkOma-value/image-video?style=flat&logo=github&color=F7DF1E&logoColor=white" alt="stars"></a>
<a href="https://github.com/KkOma-value/image-video/network/members"><img src="https://img.shields.io/github/forks/KkOma-value/image-video?style=flat&logo=github&color=4FC08D&logoColor=white" alt="forks"></a>
<a href="https://github.com/KkOma-value/image-video/issues"><img src="https://img.shields.io/github/issues/KkOma-value/image-video?style=flat&logo=github&color=F05032&logoColor=white" alt="issues"></a>
<a href="https://github.com/KkOma-value/image-video/blob/main/LICENSE"><img src="https://img.shields.io/github/license/KkOma-value/image-video?style=flat&color=0969DA" alt="license"></a>

<br>

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=24&duration=3000&pause=1000&color=58A6FF&center=true&vCenter=true&multiline=true&repeat=true&width=600&height=100&lines=%F0%9F%94%84+Paste+Douyin+share+links;Download+watermark-free+videos+%26+images;Support+single+%26+batch+mode" alt="Typing SVG" />

</div>

<br>

## Features

<table>
<tr>
<td width="50%">

### Single Parse
Paste one share link, preview the video/image, and download the original without watermark.

</td>
<td width="50%">

### Batch Parse
Paste up to **20 links** at once, parse them all in one go. Perfect for bulk downloading.

</td>
</tr>
<tr>
<td width="50%">

### Video Support
Extracts the highest bitrate source available. Cover preview, author info, and interaction stats included.

</td>
<td width="50%">

### Image Support
Handles image-type posts (slideshows) — downloads all images as a ZIP archive.

</td>
</tr>
</table>

<br>

## Tech Stack

<div align="center">

<table>
<tr>
<td align="center"><strong>Frontend</strong></td>
<td align="center"><strong>Backend</strong></td>
</tr>
<tr>
<td>

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| HTTP Client | Axios |

</td>
<td>

| Layer | Choice |
|-------|--------|
| Framework | FastAPI |
| Language | Python 3.13 |
| Validation | Pydantic |
| HTTP Client | httpx |
| Rate Limiting | In-memory middleware |
| CORS | Configurable via env |

</td>
</tr>
</table>

</div>

<br>

## Quick Start

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server (default: http://localhost:8000)
python main.py
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev
```

<br>

## API Reference

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/parse` | Parse a single Douyin URL |
| `POST` | `/download` | Parse and stream the file (video/mp4 or zip) |
| `POST` | `/parse/batch` | Parse up to 20 URLs at once |

### Request Body

```json
{
  "url": "https://v.douyin.com/xxxxx/",
  "download_type": "video"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "type": "video",
    "aweme_id": "7300000000000000000",
    "desc": "Video description here",
    "video_url": "https://...",
    "cover_url": "https://...",
    "author": {
      "nickname": "Author",
      "unique_id": "author_id",
      "avatar_url": "https://..."
    },
    "stats": {
      "digg_count": 12000,
      "comment_count": 340,
      "share_count": 56,
      "collect_count": 890
    }
  }
}
```

<br>

## Project Structure

```
image-video/
├── backend/
│   ├── main.py                 # FastAPI app entry, CORS, rate limiter
│   ├── models/
│   │   └── schemas.py          # Pydantic models & error codes
│   ├── routers/
│   │   └── api.py              # API endpoints
│   ├── services/
│   │   ├── douyin_parser.py    # Core parsing logic
│   │   └── downloader.py       # Video/image download service
│   └── utils/
│       └── http_client.py      # Shared httpx client
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main app with single/batch modes
│   │   ├── components/
│   │   │   ├── UrlInput.tsx    # URL input with paste detection
│   │   │   ├── BatchInput.tsx  # Multi-URL textarea
│   │   │   ├── ParseResult.tsx # Result display card
│   │   │   ├── VideoPreview.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── DownloadButton.tsx
│   │   │   └── Footer.tsx
│   │   ├── hooks/
│   │   │   └── useDouyinParser.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── api.ts          # Axios API layer
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

<br>

## How It Works

```mermaid
flowchart LR
    A[User pastes Douyin link] --> B{Valid URL?}
    B -->|No| C[Show error]
    B -->|Yes| D[Backend fetches page HTML]
    D --> E[Extract JSON from script tags]
    E --> F{Video or Image?}
    F -->|Video| G[Return highest bitrate source]
    F -->|Image| H[Return all image URLs]
    G --> I[Stream video / show preview]
    H --> J[Download as ZIP]
```

<br>

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |

<br>

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<br>

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

<br>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=16&duration=2500&pause=800&color=8B949E&center=true&vCenter=true&repeat=true&width=400&height=40&lines=Made+with+%E2%9D%A4+by+KkOma-value" alt="footer" />

</div>
