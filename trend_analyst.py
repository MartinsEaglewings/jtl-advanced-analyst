"""
JTL ADVANCED — Trend Analyst
Independent trend-analysis module.

This module does not modify the existing indicator analyst.
It analyzes candle structure, moving averages, momentum,
and recent price direction to determine the current trend.
"""

from indicators import sma, ema, calculate_momentum


def _safe_number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def analyze_trend(candles):
    """
    Analyze the current market trend from chronological candles.

    Returns:
        dict containing trend direction, strength, score,
        confidence, observations, and supporting values.
    """

    if not candles or len(candles) < 20:
        return {
            "trend": "INSUFFICIENT DATA",
            "direction": "NEUTRAL",
            "strength": 0,
            "confidence": 0,
            "score": 0,
            "observations": [
                "At least 20 candles are required for trend analysis."
            ],
        }

    closes = []

    for candle in candles:
        if isinstance(candle, dict):
            value = (
                candle.get("close")
                or candle.get("Close")
            )
        else:
            value = None

        number = _safe_number(value)

        if number is not None:
            closes.append(number)

    if len(closes) < 20:
        return {
            "trend": "INSUFFICIENT DATA",
            "direction": "NEUTRAL",
            "strength": 0,
            "confidence": 0,
            "score": 0,
            "observations": [
                "Not enough valid closing prices were received."
            ],
        }

    current_price = closes[-1]

    sma20 = sma(closes, 20)
    ema20 = ema(closes, 20)
    momentum10 = calculate_momentum(closes, 10)

    score = 0
    observations = []

    # Price versus SMA20
    if sma20 is not None:
        if current_price > sma20:
            score += 1
            observations.append(
                "Price is above the 20-period SMA."
            )
        elif current_price < sma20:
            score -= 1
            observations.append(
                "Price is below the 20-period SMA."
            )
        else:
            observations.append(
                "Price is around the 20-period SMA."
            )

    # Price versus EMA20
    if ema20 is not None:
        if current_price > ema20:
            score += 1
            observations.append(
                "Price is above the 20-period EMA."
            )
        elif current_price < ema20:
            score -= 1
            observations.append(
                "Price is below the 20-period EMA."
            )
        else:
            observations.append(
                "Price is around the 20-period EMA."
            )

    # EMA/SMA relationship
    if ema20 is not None and sma20 is not None:
        if ema20 > sma20:
            score += 1
            observations.append(
                "EMA20 is above SMA20, supporting upward trend structure."
            )
        elif ema20 < sma20:
            score -= 1
            observations.append(
                "EMA20 is below SMA20, supporting downward trend structure."
            )
        else:
            observations.append(
                "EMA20 and SMA20 are closely aligned."
            )

    # Momentum
    if momentum10 is not None:
        if momentum10 > 0:
            score += 1
            observations.append(
                "Recent price momentum is positive."
            )
        elif momentum10 < 0:
            score -= 1
            observations.append(
                "Recent price momentum is negative."
            )
        else:
            observations.append(
                "Recent price momentum is neutral."
            )

    # Recent price structure
    recent = closes[-10:]
    first_recent = recent[0]
    last_recent = recent[-1]

    if last_recent > first_recent:
        score += 1
        observations.append(
            "Recent price structure is moving upward."
        )
    elif last_recent < first_recent:
        score -= 1
        observations.append(
            "Recent price structure is moving downward."
        )
    else:
        observations.append(
            "Recent price structure is relatively flat."
        )

    # Determine trend
    if score >= 4:
        trend = "STRONG BULLISH TREND"
        direction = "BULLISH"
    elif score >= 2:
        trend = "BULLISH TREND"
        direction = "BULLISH"
    elif score <= -4:
        trend = "STRONG BEARISH TREND"
        direction = "BEARISH"
    elif score <= -2:
        trend = "BEARISH TREND"
        direction = "BEARISH"
    else:
        trend = "SIDEWAYS / MIXED TREND"
        direction = "NEUTRAL"

    # Maximum theoretical score is 5.
    strength = min(abs(score) * 20, 100)

    # Confidence is deliberately presented as a
    # technical-consensus measure, not a prediction.
    confidence = min(50 + abs(score) * 10, 90)

    return {
        "trend": trend,
        "direction": direction,
        "strength": strength,
        "confidence": confidence,
        "score": score,
        "current_price": current_price,
        "sma20": sma20,
        "ema20": ema20,
        "momentum10": momentum10,
        "observations": observations,
    }
