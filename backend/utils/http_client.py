from urllib.parse import urlparse
import httpx

MOBILE_UA = (
    "Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-G973U) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "SamsungBrowser/14.0 Chrome/87.0.4280.141 Mobile Safari/537.36"
)

TIMEOUT = 15.0

ALLOWED_DOMAINS = {
    "v.douyin.com", "douyin.com", "www.douyin.com",
    "www.iesdouyin.com", "iesdouyin.com",
    "aweme.snssdk.com", "snssdk.com",
    "douyinpic.com", "pstatp.com",
    "douyinvod.com", "douyincdn.com",
    "bytecdn.cn", "ibytedtos.com",
    "ixigua.com", "ixiguavideo.com",
}


async def _validate_redirect(request: httpx.Request) -> None:
    """Prevent SSRF by blocking redirects to non-allowed domains."""
    parsed = urlparse(str(request.url))
    domain = parsed.netloc.lower()
    parts = domain.split(".")
    allowed = False
    for i in range(len(parts) - 1):
        candidate = ".".join(parts[i:])
        if candidate in ALLOWED_DOMAINS:
            allowed = True
            break
    if not allowed and domain not in ALLOWED_DOMAINS:
        raise httpx.TooManyRedirects(f"Redirect to disallowed domain: {domain}")


def get_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        headers={"User-Agent": MOBILE_UA},
        follow_redirects=True,
        timeout=TIMEOUT,
        event_hooks={"request": [_validate_redirect]},
    )
