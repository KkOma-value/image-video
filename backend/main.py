import os
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from routers.api import router as api_router

app = FastAPI(
    title="抖音去水印解析下载",
    version="1.0.0",
    client_max_body_size=4096,
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory rate limiter
_rate_limit_store: dict[str, list[float]] = {}
_RATE_LIMIT = 10  # requests
_RATE_WINDOW = 60.0  # seconds


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - _RATE_WINDOW

    # Clean old entries
    if client_ip in _rate_limit_store:
        _rate_limit_store[client_ip] = [
            ts for ts in _rate_limit_store[client_ip] if ts > window_start
        ]
        if len(_rate_limit_store[client_ip]) >= _RATE_LIMIT:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": {
                        "code": "RATE_LIMITED",
                        "message": "请求过于频繁，请稍后再试",
                    },
                },
            )
    else:
        _rate_limit_store[client_ip] = []

    _rate_limit_store[client_ip].append(now)
    return await call_next(request)


app.include_router(api_router, prefix="/api/v1")
