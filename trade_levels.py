"""
JTL ADVANCED — Trade Levels Analyst

Independent calculation engine for:
- Entry reference
- Stop-loss reference
- TP1
- TP2
- TP3
- Risk/reward ratios

Uses existing OHLC candle data.
Does not make additional API requests.
"""

def _number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _atr(candles, period=14):
    """
    Calculate Average True Range from existing OHLC candles.
    """
    if len(candles) < period + 1:
        return None

    true_ranges = []

    previous_close = None

    for candle in candles:
        high = _number(candle.get("high"))
        low = _number(candle.get("low"))
        close = _number(candle.get("close"))

        if high is None or low is None or close is None:
            continue

        if previous_close is None:
            true_range = high - low
        else:
            true_range = max(
                high - low,
                abs(high - previous_close),
                abs(low - previous_close)
            )

        true_ranges.append(true_range)
        previous_close = close

    if len(true_ranges) < period:
        return None

    return sum(true_ranges[-period:]) / period


def _recent_high(candles, lookback=20):
    highs = []

    for candle in candles[-lookback:]:
        value = _number(candle.get("high"))
        if value is not None:
            highs.append(value)

    return max(highs) if highs else None


def _recent_low(candles, lookback=20):
    lows = []

    for candle in candles[-lookback:]:
        value = _number(candle.get("low"))
        if value is not None:
            lows.append(value)

    return min(lows) if lows else None


def calculate_trade_levels(candles, direction=None):
    """
    Calculate technical trade-level references.

    direction:
        BULLISH / LONG
        BEARISH / SHORT
        NEUTRAL

    If direction is omitted, it is inferred from recent price structure.
    """

    if not candles or len(candles) < 20:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "At least 20 candles are required."
        }

    closes = []

    for candle in candles:
        close = _number(candle.get("close"))

        if close is not None:
            closes.append(close)

    if len(closes) < 20:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "Not enough valid closing prices."
        }

    current_price = closes[-1]

    # Infer direction if the caller has not supplied one.
    if direction:
        direction = str(direction).upper()
    else:
        old_price = closes[-10]

        if current_price > old_price:
            direction = "LONG"
        elif current_price < old_price:
            direction = "SHORT"
        else:
            direction = "NEUTRAL"

    atr = _atr(candles, 14)

    recent_high = _recent_high(candles, 20)
    recent_low = _recent_low(candles, 20)

    if atr is None:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "ATR could not be calculated."
        }

    # Use volatility-based target distances.
    # These are technical reference levels, not guaranteed outcomes.
    risk_distance = atr

    if direction in ("LONG", "BULLISH"):

        stop_loss = current_price - risk_distance

        tp1 = current_price + (risk_distance * 1.0)
        tp2 = current_price + (risk_distance * 2.0)
        tp3 = current_price + (risk_distance * 3.0)

        direction_label = "LONG"

    elif direction in ("SHORT", "BEARISH"):

        stop_loss = current_price + risk_distance

        tp1 = current_price - (risk_distance * 1.0)
        tp2 = current_price - (risk_distance * 2.0)
        tp3 = current_price - (risk_distance * 3.0)

        direction_label = "SHORT"

    else:

        return {
            "status": "NO_DIRECTION",
            "direction": "NEUTRAL",
            "current_price": current_price,
            "message": (
                "The current market structure does not provide "
                "a directional trade-level calculation."
            )
        }

    return {
        "status": "READY",
        "direction": direction_label,

        "current_price": current_price,

        "entry_reference": current_price,

        "stop_loss": stop_loss,

        "tp1": tp1,
        "tp2": tp2,
        "tp3": tp3,

        "risk_distance": risk_distance,

        "risk_reward_tp1": 1.0,
        "risk_reward_tp2": 2.0,
        "risk_reward_tp3": 3.0,

        "atr14": atr,

        "recent_high": recent_high,
        "recent_low": recent_low,

        "message": (
            "Technical reference levels calculated from "
            "recent market volatility."
        )
    }
