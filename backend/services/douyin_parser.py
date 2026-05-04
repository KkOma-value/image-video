import re
import json
from urllib.parse import urlparse, unquote
from utils.http_client import get_client
from models.schemas import (
    AuthorInfo,
    StatsInfo,
    ImageInfo,
    VideoResult,
    ImageResult,
)


def _extract_brace_json(text: str, start: int) -> str | None:
    """Extract a JSON object from text using brace counting, starting at `start`."""
    brace_count = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            brace_count += 1
        elif text[i] == "}":
            brace_count -= 1
            if brace_count == 0:
                return text[start : i + 1]
    return None


class DouyinParser:
    DOUYIN_DOMAINS = {"v.douyin.com", "www.douyin.com", "douyin.com",
                      "www.iesdouyin.com", "iesdouyin.com"}

    @staticmethod
    def is_valid_url(url: str) -> bool:
        try:
            parsed = urlparse(url)
            # IDNA-encode to catch Unicode homograph attacks
            domain = parsed.netloc.lower().encode("idna").decode("ascii")
            domain = domain.removeprefix("www.")
            return domain in DouyinParser.DOUYIN_DOMAINS
        except Exception:
            return False

    @staticmethod
    def _extract_aweme_id(url: str) -> str:
        match = re.search(r"/share/video/(\d+)", url)
        if match:
            return match.group(1)
        match = re.search(r"/video/(\d+)", url)
        if match:
            return match.group(1)
        match = re.search(r"modal_id=(\d+)", url)
        if match:
            return match.group(1)
        return ""

    async def parse(self, url: str) -> VideoResult | ImageResult:
        url = self._normalize_url(url)
        client = get_client()

        try:
            response = await client.get(url)
            html = response.text

            json_data = self._extract_json(html)
            if json_data is None:
                json_data = self._extract_json_fallback(html)
            if json_data is None:
                json_data = self._extract_json_from_var(html, "SSR_DATA")

            # If direct page fails, retry with share URL constructed from modal_id
            if json_data is None:
                aweme_id = self._extract_aweme_id(url)
                if aweme_id:
                    share_urls = [
                        f"https://www.iesdouyin.com/share/video/{aweme_id}/",
                        f"https://www.iesdouyin.com/share/note/{aweme_id}/",
                    ]
                    for share_url in share_urls:
                        r = await client.get(share_url)
                        h = r.text
                        json_data = self._extract_json(h)
                        if json_data is None:
                            json_data = self._extract_json_fallback(h)
                        if json_data is not None:
                            break

            if json_data is None:
                raise ValueError("无法从页面提取数据")

            item = self._find_item(json_data)
            if item is None:
                raise ValueError("未找到作品数据")

            return self._build_result(item)

        finally:
            await client.aclose()

    @staticmethod
    def _normalize_url(url: str) -> str:
        """Convert various Douyin URL formats to a standard share URL."""
        # Extract aweme_id from modal_id in www.douyin.com search/browse URLs
        if "www.douyin.com" in url or "douyin.com" in url:
            aweme_id = DouyinParser._extract_aweme_id(url)
            if "modal_id=" in url and aweme_id:
                return f"https://www.iesdouyin.com/share/video/{aweme_id}/"
        return url

    @staticmethod
    def _extract_json_from_var(html: str, var_name: str) -> dict | None:
        """Extract JSON assigned to a window variable (e.g. _ROUTER_DATA, _SSR_DATA)."""
        markers = [f"window.{var_name} = ", f"window.{var_name}="]
        for marker in markers:
            pos = html.find(marker)
            if pos < 0:
                continue
            pos += len(marker)
            while pos < len(html) and html[pos] in " \t\n\r":
                pos += 1
            if pos >= len(html) or html[pos] != "{":
                continue
            json_str = _extract_brace_json(html, pos)
            if json_str:
                try:
                    return json.loads(json_str)
                except (json.JSONDecodeError, Exception):
                    pass
        return None

    @staticmethod
    def _extract_json_from_script(html: str, script_id: str) -> dict | None:
        """Extract JSON from a <script id="..."> tag content."""
        for quote in ('"', "'"):
            marker = f"id={quote}{script_id}{quote}"
            idx = html.find(marker)
            if idx < 0:
                continue
            brace_start = html.find("{", idx)
            if brace_start < 0:
                continue
            json_str = _extract_brace_json(html, brace_start)
            if json_str:
                try:
                    text = unquote(json_str)
                    return json.loads(text)
                except (json.JSONDecodeError, Exception):
                    # Try without unquoting
                    try:
                        return json.loads(json_str)
                    except (json.JSONDecodeError, Exception):
                        pass
        return None

    def _extract_json(self, html: str) -> dict | None:
        return self._extract_json_from_script(html, "RENDER_DATA")

    def _extract_json_fallback(self, html: str) -> dict | None:
        return self._extract_json_from_var(html, "_ROUTER_DATA")

    def _extract_ssr_data(self, html: str) -> dict | None:
        return self._extract_json_from_var(html, "_SSR_DATA")

    @staticmethod
    def _find_item(data: dict) -> dict | None:
        paths = [
            ["loaderData", "video_(id)/page", "videoInfoRes", "item_list", 0],
            ["31", "videoInfoRes", "item_list", 0],
            ["data", "item_list", 0],
        ]

        for path in paths:
            current = data
            try:
                for key in path:
                    if isinstance(key, int):
                        current = current[key]
                    elif "(id)" in key:
                        prefix, suffix = key.split("(id)")
                        matched = next(
                            (k for k in current if k.startswith(prefix) and k.endswith(suffix)),
                            None,
                        )
                        if matched is None:
                            raise KeyError
                        current = current[matched]
                    else:
                        current = current[key]
                if isinstance(current, dict) and (
                    "aweme_id" in current or "video" in current or "images" in current
                ):
                    return current
            except (KeyError, IndexError, TypeError):
                continue

        return DouyinParser._deep_find_item(data)

    @staticmethod
    def _deep_find_item(obj, depth: int = 0) -> dict | None:
        if depth > 10 or not isinstance(obj, (dict, list)):
            return None

        if isinstance(obj, dict):
            if "aweme_id" in obj and ("video" in obj or "images" in obj):
                return obj
            if "item_list" in obj and isinstance(obj["item_list"], list) and obj["item_list"]:
                first = obj["item_list"][0]
                if isinstance(first, dict) and "aweme_id" in first:
                    return first
            for value in obj.values():
                result = DouyinParser._deep_find_item(value, depth + 1)
                if result:
                    return result

        if isinstance(obj, list):
            for item in obj:
                result = DouyinParser._deep_find_item(item, depth + 1)
                if result:
                    return result

        return None

    @staticmethod
    def _build_result(item: dict) -> VideoResult | ImageResult:
        aweme_id = str(item.get("aweme_id", ""))
        desc = item.get("desc", "")

        author_raw = item.get("author", {})
        author = AuthorInfo(
            nickname=author_raw.get("nickname", ""),
            unique_id=author_raw.get("unique_id", ""),
            avatar_url=DouyinParser._pick_best_avatar(author_raw),
        )

        stats_raw = item.get("statistics", {})
        stats = StatsInfo(
            digg_count=stats_raw.get("digg_count", 0),
            comment_count=stats_raw.get("comment_count", 0),
            share_count=stats_raw.get("share_count", 0),
            collect_count=stats_raw.get("collect_count", 0),
        )

        images_raw = item.get("images") or item.get("image_infos")
        video = item.get("video")

        image_list = DouyinParser._parse_image_list(images_raw) if images_raw else []

        if video:
            return DouyinParser._build_video_result(aweme_id, desc, video, author, stats, image_list)
        elif image_list:
            return DouyinParser._build_image_result(aweme_id, desc, image_list, author, stats)
        else:
            raise ValueError("不支持的作品类型")

    @staticmethod
    def _build_video_result(
        aweme_id: str, desc: str, video: dict,
        author: AuthorInfo, stats: StatsInfo,
        images: list[ImageInfo] | None = None,
    ) -> VideoResult:
        play_addr = video.get("play_addr", {})
        url_list = play_addr.get("url_list", [])

        video_url = ""
        if url_list:
            video_url = url_list[0].replace("playwm", "play")

        cover = video.get("cover", {})
        cover_list = cover.get("url_list", [])
        cover_url = cover_list[0] if cover_list else ""
        dynamic_cover = video.get("dynamic_cover", {})
        dynamic_list = dynamic_cover.get("url_list", [])
        if dynamic_list:
            cover_url = dynamic_list[0]

        width = video.get("width", 0)
        height = video.get("height", 0)

        bit_rate_list = video.get("bit_rate", [])
        if bit_rate_list:
            best = max(bit_rate_list, key=lambda x: x.get("bit_rate", 0))
            play_addr_hq = best.get("play_addr", {})
            hq_list = play_addr_hq.get("url_list", [])
            if hq_list:
                video_url = hq_list[0].replace("playwm", "play")

        return VideoResult(
            type="video",
            aweme_id=aweme_id,
            desc=desc,
            video_url=video_url,
            cover_url=cover_url,
            width=width,
            height=height,
            author=author,
            stats=stats,
            images=images or [],
        )

    @staticmethod
    def _parse_image_list(images: dict | list) -> list[ImageInfo]:
        """Parse watermark-free image URLs from raw image data."""
        result: list[ImageInfo] = []
        if isinstance(images, dict):
            for idx_str in sorted(images.keys(), key=lambda k: int(k) if k.isdigit() else 0):
                info = images[idx_str]
                urls = DouyinParser._filter_watermark_urls(info.get("url_list", []), is_image=True)
                if urls:
                    result.append(ImageInfo(
                        url=urls[0],
                        width=info.get("width", 0),
                        height=info.get("height", 0),
                        index=int(idx_str) if idx_str.isdigit() else len(result),
                    ))
        elif isinstance(images, list):
            for i, info in enumerate(images):
                urls = DouyinParser._filter_watermark_urls(info.get("url_list", []), is_image=True)
                if urls:
                    result.append(ImageInfo(
                        url=urls[0],
                        width=info.get("width", 0),
                        height=info.get("height", 0),
                        index=i,
                    ))
        return result

    @staticmethod
    def _build_image_result(
        aweme_id: str, desc: str, images: list[ImageInfo],
        author: AuthorInfo, stats: StatsInfo,
    ) -> ImageResult:
        if not images:
            raise ValueError("未找到无水印图片")
        return ImageResult(
            type="image",
            aweme_id=aweme_id,
            desc=desc,
            images=images,
            author=author,
            stats=stats,
        )

    @staticmethod
    def _filter_watermark_urls(url_list: list[str], is_image: bool = False) -> list[str]:
        result = []
        for url in url_list:
            if not is_image and "playwm" in url:
                url = url.replace("playwm", "play")
            if is_image and "/obj/" in url:
                continue
            if "watermark=1" in url:
                continue
            result.append(url)
        return result

    @staticmethod
    def _pick_best_avatar(author: dict) -> str:
        for key in ("avatar_300x300", "avatar_medium", "avatar_thumb"):
            val = author.get(key, {})
            if isinstance(val, dict):
                urls = val.get("url_list", [])
                if urls:
                    return urls[0]
        return ""
