"""
JTL ADVANCED — cTrader Open API Gateway

Lightweight REST/OAuth layer.
No cTrader Python SDK required.

Secrets are read from environment variables.
Never place the client secret in frontend JavaScript.
"""

import os
import time
import requests
from urllib.parse import urlencode


CTRADER_AUTH_URL = "https://id.ctrader.com/my/settings/openapi/grantingaccess/"
CTRADER_TOKEN_URL = "https://openapi.ctrader.com/apps/token"

DEMO_HOST = "demo.ctraderapi.com"
LIVE_HOST = "live.ctraderapi.com"

JSON_PORT = 5036


def get_config():
    return {
        "client_id": os.getenv("CTRADER_CLIENT_ID", "").strip(),
        "client_secret": os.getenv("CTRADER_CLIENT_SECRET", "").strip(),
        "redirect_uri": os.getenv(
            "CTRADER_REDIRECT_URI",
            "http://127.0.0.1:5000/api/ctrader/callback"
        ).strip(),
        "environment": os.getenv(
            "CTRADER_ENVIRONMENT",
            "demo"
        ).strip().lower(),
        "scope": os.getenv(
            "CTRADER_SCOPE",
            "accounts"
        ).strip().lower(),
    }


def configuration_status():
    config = get_config()

    return {
        "configured": bool(
            config["client_id"]
            and config["client_secret"]
        ),
        "client_id_configured": bool(
            config["client_id"]
        ),
        "client_secret_configured": bool(
            config["client_secret"]
        ),
        "redirect_uri": config["redirect_uri"],
        "environment": config["environment"],
        "scope": config["scope"],
        "host": (
            LIVE_HOST
            if config["environment"] == "live"
            else DEMO_HOST
        ),
        "port": JSON_PORT,
    }


def authorization_url():
    config = get_config()

    if not config["client_id"]:
        raise RuntimeError(
            "CTRADER_CLIENT_ID is not configured."
        )

    params = {
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "scope": config["scope"],
        "product": "web",
    }

    return CTRADER_AUTH_URL + "?" + urlencode(params)


def exchange_authorization_code(code):
    config = get_config()

    if not config["client_id"]:
        raise RuntimeError(
            "CTRADER_CLIENT_ID is not configured."
        )

    if not config["client_secret"]:
        raise RuntimeError(
            "CTRADER_CLIENT_SECRET is not configured."
        )

    response = requests.get(
        CTRADER_TOKEN_URL,
        params={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": config["redirect_uri"],
            "client_id": config["client_id"],
            "client_secret": config["client_secret"],
        },
        timeout=20,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("errorCode"):
        raise RuntimeError(
            data.get(
                "description",
                data["errorCode"]
            )
        )

    return data


def refresh_access_token(refresh_token):
    config = get_config()

    if not config["client_id"]:
        raise RuntimeError(
            "CTRADER_CLIENT_ID is not configured."
        )

    if not config["client_secret"]:
        raise RuntimeError(
            "CTRADER_CLIENT_SECRET is not configured."
        )

    response = requests.get(
        CTRADER_TOKEN_URL,
        params={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": config["client_id"],
            "client_secret": config["client_secret"],
        },
        timeout=20,
    )

    response.raise_for_status()

    data = response.json()

    if data.get("errorCode"):
        raise RuntimeError(
            data.get(
                "description",
                data["errorCode"]
            )
        )

    return data


def build_status():
    status = configuration_status()

    status.update({
        "provider": "cTrader Open API",
        "api": "Open API",
        "transport": "JSON",
        "port": JSON_PORT,
        "authenticated": False,
        "account_connected": False,
        "market_data": False,
        "execution": False,
        "last_checked": int(time.time()),
    })

    return status
