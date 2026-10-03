"""
JTL ADVANCED — MetaApi MT5 Gateway

Connects JTL ADVANCED to MetaApi without exposing
the MetaApi authentication token to the frontend.

The token is loaded only from:
    .metaapi_token
"""

from pathlib import Path
import json
import urllib.request
import urllib.error


BASE_URL = (
    "https://mt-provisioning-api-v1."
    "agiliumtrade.agiliumtrade.ai"
)

TOKEN_FILE = Path(__file__).resolve().parent / ".metaapi_token"


class MetaApiError(Exception):
    pass


def load_token():
    if not TOKEN_FILE.exists():
        raise MetaApiError("MetaApi token file is missing.")

    token = TOKEN_FILE.read_text().strip()

    if not token:
        raise MetaApiError("MetaApi token file is empty.")

    return token


def api_request(method, path):
    token = load_token()

    url = BASE_URL.rstrip("/") + "/" + path.lstrip("/")

    request = urllib.request.Request(
        url,
        method=method,
        headers={
            "Accept": "application/json",
            "auth-token": token,
        },
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=20,
        ) as response:

            raw = response.read().decode("utf-8")

            if not raw:
                return {}

            return json.loads(raw)

    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")

        raise MetaApiError(
            f"MetaApi HTTP {exc.code}: {body}"
        ) from exc

    except urllib.error.URLError as exc:
        raise MetaApiError(
            f"MetaApi connection failed: {exc.reason}"
        ) from exc


def list_accounts():
    return api_request(
        "GET",
        "/users/current/accounts",
    )


def get_account(account_id):
    if not account_id:
        raise MetaApiError(
            "MetaApi account ID is required."
        )

    return api_request(
        "GET",
        f"/users/current/accounts/{account_id}",
    )


if __name__ == "__main__":
    try:
        accounts = list_accounts()

        print("METAAPI CONNECTION: SUCCESS")

        if isinstance(accounts, list):
            print(f"MT5 ACCOUNTS FOUND: {len(accounts)}")
        elif isinstance(accounts, dict):
            items = (
                accounts.get("items")
                or accounts.get("accounts")
                or []
            )

            print(f"MT5 ACCOUNTS FOUND: {len(items)}")

        print("TOKEN: NOT DISPLAYED")

    except MetaApiError as exc:
        print("METAAPI CONNECTION: FAILED")
        print(str(exc))
