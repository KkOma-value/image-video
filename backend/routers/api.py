import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import io

from models.schemas import ParseRequest, BatchParseRequest, ErrorCodes
from services.douyin_parser import DouyinParser
from services.downloader import download_video, download_images_as_zip

logger = logging.getLogger(__name__)
router = APIRouter()
parser = DouyinParser()


@router.post("/parse")
async def parse_link(req: ParseRequest):
    url = req.url.strip()

    if not parser.is_valid_url(url):
        return {"success": False, "error": ErrorCodes.INVALID_URL}

    try:
        result = await parser.parse(url)
        return {"success": True, "data": result.model_dump()}
    except ValueError as e:
        msg = str(e)
        if "不存在" in msg or "删除" in msg:
            return {"success": False, "error": ErrorCodes.NOT_FOUND}
        if "不支持" in msg:
            return {"success": False, "error": ErrorCodes.UNSUPPORTED_TYPE}
        return {"success": False, "error": ErrorCodes.PARSE_FAILED}
    except Exception as e:
        logger.error("Parse error: %s", e)
        return {"success": False, "error": ErrorCodes.PARSE_FAILED}


@router.post("/download")
async def download_file(req: ParseRequest):
    url = req.url.strip()

    if not parser.is_valid_url(url):
        raise HTTPException(status_code=400, detail="无效的抖音链接")

    try:
        result = await parser.parse(url)
    except Exception as e:
        raise HTTPException(status_code=502, detail="解析失败") from e

    # If explicitly requesting images, download them as ZIP
    if req.download_type == "images":
        image_urls = [img.url for img in result.images]
        if not image_urls:
            raise HTTPException(status_code=400, detail="该作品没有图片")
        content = await download_images_as_zip(image_urls, result.aweme_id)
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="douyin_images_{result.aweme_id}.zip"'
            },
        )

    # Default: download video for video type, images for image type
    if result.type == "video":
        content, filename = await download_video(result.video_url)
        return StreamingResponse(
            io.BytesIO(content),
            media_type="video/mp4",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    else:
        urls = [img.url for img in result.images]
        content = await download_images_as_zip(urls, result.aweme_id)
        return StreamingResponse(
            io.BytesIO(content),
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="douyin_images_{result.aweme_id}.zip"'
            },
        )


@router.post("/parse/batch")
async def parse_batch(req: BatchParseRequest):
    urls = [u.strip() for u in req.urls if u.strip()]
    if not urls:
        return {"success": False, "error": ErrorCodes.INVALID_URL}
    if len(urls) > 20:
        return {
            "success": False,
            "error": {"code": "TOO_MANY", "message": "单次最多解析20个链接"},
        }

    results = []
    for url in urls:
        if not parser.is_valid_url(url):
            results.append({"url": url, "success": False, "error": ErrorCodes.INVALID_URL})
            continue
        try:
            result = await parser.parse(url)
            results.append({"url": url, "success": True, "data": result.model_dump()})
        except Exception:
            results.append({"url": url, "success": False, "error": ErrorCodes.PARSE_FAILED})

    return {"success": True, "data": {"total": len(results), "results": results}}
