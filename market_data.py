import os
import requests
from pathlib import Path

BASE_URL = "https://api.twelvedata.com"
KEY_FILE = Path(__file__).parent / ".twelve_data_key"

def get_twelve_data_api_key():
    key = os.getenv("TWELVE_DATA_API_KEY", "").strip()

    if key:
        return key

    if KEY_FILE.exists():
        return KEY_FILE.read_text().strip()

    return ""


def get_api_key():
    return get_twelve_data_api_key()


def request(endpoint, params=None):
    params = params or {}

    params["apikey"] = get_api_key()

    response = requests.get(
        f"{BASE_URL}{endpoint}",
        params=params,
        timeout=20
    )

    response.raise_for_status()

    data = response.json()

    if data.get("status") == "error":
        raise RuntimeError(
            data.get("message", "Twelve Data API error.")
        )

    return data


def get_crypto_list():
    data = request(
        "/cryptocurrencies",
        {
            "format": "JSON"
        }
    )

    return data.get("data", [])


def get_current_price(symbol):
    data = request(
        "/price",
        {
            "symbol": symbol,
            "dp": 8
        }
    )

    if "price" not in data:
        raise RuntimeError(
            f"No current price returned for {symbol}."
        )

    return float(data["price"])


def fetch_market_data(
    symbol="BTC/USD",
    interval="1min",
    outputsize=100
):

    data = request(
        "/time_series",
        {
            "symbol": symbol,
            "interval": interval,
            "outputsize": outputsize,
            "format": "JSON"
        }
    )

    if "values" not in data:
        raise RuntimeError(
            f"No candle data returned for {symbol}."
        )

    candles = []

    for item in reversed(data["values"]):

        candles.append({
            "datetime": item.get("datetime"),
            "open": float(item["open"]),
            "high": float(item["high"]),
            "low": float(item["low"]),
            "close": float(item["close"]),
            "volume": float(
                item.get("volume", 0)
            )
        })

    meta = data.get("meta", {})

    current_price = get_current_price(symbol)

    return {
        "symbol": meta.get(
            "symbol",
            symbol
        ),

        "interval": meta.get(
            "interval",
            interval
        ),

        "exchange": meta.get(
            "exchange",
            "Crypto"
        ),

        "currency": meta.get(
            "currency",
            "USD"
        ),

        "current_price": current_price,

        "candles": candles
    }
