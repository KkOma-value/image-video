import io
import zipfile
import httpx
from utils.http_client import MOBILE_UA


async def download_video(url: str) -> tuple[bytes, str]:
    """Download video bytes from URL."""
    async with httpx.AsyncClient(
        headers={"User-Agent": MOBILE_UA},
        follow_redirects=True,
        timeout=60.0,
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        content_type = response.headers.get("content-type", "video/mp4")
        ext = "mp4" if "mp4" in content_type else "bin"
        return response.content, f"douyin_video.{ext}"


async def download_images_as_zip(image_urls: list[str], aweme_id: str) -> bytes:
    """Download multiple images and pack into a ZIP file."""
    buffer = io.BytesIO()
    async with httpx.AsyncClient(
        headers={"User-Agent": MOBILE_UA},
        follow_redirects=True,
        timeout=60.0,
    ) as client:
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            for i, url in enumerate(image_urls):
                try:
                    response = await client.get(url)
                    response.raise_for_status()
                    content_type = response.headers.get("content-type", "")
                    ext = "jpg"
                    if "png" in content_type:
                        ext = "png"
                    elif "webp" in content_type:
                        ext = "webp"
                    zf.writestr(f"image_{i + 1:02d}.{ext}", response.content)
                except Exception:
                    continue

    buffer.seek(0)
    return buffer.getvalue()
