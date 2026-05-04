from pydantic import BaseModel, Field


class ParseRequest(BaseModel):
    url: str = Field(
        ...,
        min_length=10,
        max_length=2048,
        pattern=r"^https?://",
    )
    download_type: str | None = Field(default=None, pattern=r"^(video|images)$")


class AuthorInfo(BaseModel):
    nickname: str
    unique_id: str
    avatar_url: str


class StatsInfo(BaseModel):
    digg_count: int
    comment_count: int
    share_count: int
    collect_count: int


class ImageInfo(BaseModel):
    url: str
    width: int
    height: int
    index: int


class VideoResult(BaseModel):
    type: str = "video"
    aweme_id: str
    desc: str
    video_url: str
    cover_url: str
    width: int
    height: int
    author: AuthorInfo
    stats: StatsInfo
    images: list[ImageInfo] = []


class ImageResult(BaseModel):
    type: str = "image"
    aweme_id: str
    desc: str
    images: list[ImageInfo]
    author: AuthorInfo
    stats: StatsInfo


class ParseSuccess(BaseModel):
    success: bool = True
    data: VideoResult | ImageResult


class ParseError(BaseModel):
    success: bool = False
    error: dict


class BatchParseRequest(BaseModel):
    urls: list[str] = Field(..., min_length=1, max_length=20)


class BatchParseResult(BaseModel):
    success: bool = True
    data: dict


class ErrorCodes:
    INVALID_URL = {"code": "INVALID_URL", "message": "请输入有效的抖音分享链接"}
    PARSE_FAILED = {"code": "PARSE_FAILED", "message": "抖音页面解析失败，请确认链接有效"}
    NOT_FOUND = {"code": "NOT_FOUND", "message": "该作品不存在或已被删除"}
    RATE_LIMITED = {"code": "RATE_LIMITED", "message": "请求过于频繁，请稍后再试"}
    UNSUPPORTED_TYPE = {"code": "UNSUPPORTED_TYPE", "message": "暂不支持该类型作品的解析"}
    UPSTREAM_ERROR = {"code": "UPSTREAM_ERROR", "message": "抖音服务暂不可达，请稍后重试"}
