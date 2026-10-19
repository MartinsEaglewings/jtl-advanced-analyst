"""
JTL ADVANCED — Trend Analyst
Independent trend-analysis module.

This module does not modify the existing indicator analyst.
It analyzes candle structure, moving averages, momentum,
and recent price direction to determine the current trend.
"""

import math

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
    candle_ranges = []

    for candle in candles:
        if isinstance(candle, dict):
            value = candle.get("close")
            if value is None:
                value = candle.get("Close")

            high_value = candle.get("high")
            if high_value is None:
                high_value = candle.get("High")

            low_value = candle.get("low")
            if low_value is None:
                low_value = candle.get("Low")

            high = _safe_number(high_value)
            low = _safe_number(low_value)
        else:
            value = None
            high = None
            low = None

        number = _safe_number(value)

        if number is not None:
            closes.append(number)
            candle_ranges.append((high, low))

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

    # Calculate strength before using it in trend classification.
    recent = closes[-10:]
    net_move = recent[-1] - recent[0]
    path_length = sum(
        abs(recent[i] - recent[i - 1])
        for i in range(1, len(recent))
    )

    efficiency = (
        abs(net_move) / path_length
        if path_length > 0
        else 0.0
    )
    efficiency = max(0.0, min(efficiency, 1.0))

    true_ranges = []
    for i in range(1, len(closes)):
        high, low = candle_ranges[i]
        previous_close = closes[i - 1]
        current_close = closes[i]

        if high is not None and low is not None:
            true_range = max(
                high - low,
                abs(high - previous_close),
                abs(low - previous_close),
            )
        else:
            true_range = abs(current_close - previous_close)

        true_ranges.append(max(0.0, true_range))

    recent_ranges = true_ranges[-14:]
    atr = (
        sum(recent_ranges) / len(recent_ranges)
        if recent_ranges
        else 0.0
    )

    if atr > 0:
        movement_factor = 1.0 - math.exp(
            -abs(net_move) / (4.0 * atr)
        )
        strength = int(round(
            100.0 * efficiency * movement_factor
        ))
    else:
        strength = 0

    strength = max(0, min(strength, 100))

    # Classify trend using both directional consensus and
    # measured price movement. Indicator agreement alone is insufficient.
    if score >= 4 and strength >= 60:
        trend = "STRONG BULLISH TREND"
        direction = "BULLISH"
    elif score >= 2 and strength >= 20:
        trend = "BULLISH TREND"
        direction = "BULLISH"
    elif score <= -4 and strength >= 60:
        trend = "STRONG BEARISH TREND"
        direction = "BEARISH"
    elif score <= -2 and strength >= 20:
        trend = "BEARISH TREND"
        direction = "BEARISH"
    else:
        trend = "SIDEWAYS / MIXED TREND"
        direction = "NEUTRAL"

    # Keep confidence bounded and reduce it when actual movement is weak.
    score_agreement = abs(score) / 5.0 * 100.0
    confidence = min(
        90,
        max(0, int(round(
            0.7 * strength + 0.3 * score_agreement
        )))
    )

    if strength < 20 and abs(score) >= 2:
        observations.append(
            "Indicator signals agree, but measured price movement is weak."
        )

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
