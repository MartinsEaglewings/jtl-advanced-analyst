"""
JTL ADVANCED — HTF Bias Engine

Higher-Timeframe Market Bias Engine.

Purpose:
- Determine higher-timeframe bullish/bearish/neutral bias
- Compare price with EMA 21 and EMA 50
- Evaluate EMA alignment
- Evaluate recent momentum
- Produce structured information for the MT5 EA dashboard

This module is intentionally independent.
It does not modify or depend on the existing Indicator Analyst.
It does not execute trades.
"""

def _number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _ema(values, period):
    if len(values) < period:
        return None

    multiplier = 2 / (period + 1)

    ema_value = sum(values[:period]) / period

    for price in values[period:]:
        ema_value = (
            (price - ema_value) * multiplier
        ) + ema_value

    return ema_value


def analyze_htf_bias(candles):
    """
    Analyze higher-timeframe market bias.

    Returns:
        BULLISH
        BEARISH
        NEUTRAL

    The result is a technical market-structure reference,
    not a prediction or trade guarantee.
    """

    if not candles or len(candles) < 50:
        return {
            "status": "INSUFFICIENT_DATA",
            "bias": "NEUTRAL",
            "strength": 0,
            "score": 0,
            "ema21": None,
            "ema50": None,
            "current_price": None,
            "observations": [
                "At least 50 valid candles are required."
            ]
        }

    closes = []

    for candle in candles:
        close = _number(candle.get("close"))

        if close is not None:
            closes.append(close)

    if len(closes) < 50:
        return {
            "status": "INSUFFICIENT_DATA",
            "bias": "NEUTRAL",
            "strength": 0,
            "score": 0,
            "ema21": None,
            "ema50": None,
            "current_price": None,
            "observations": [
                "Not enough valid closing prices."
            ]
        }

    current_price = closes[-1]

    ema21 = _ema(closes, 21)
    ema50 = _ema(closes, 50)

    score = 0
    observations = []

    # Price relative to EMA 21
    if current_price > ema21:
        score += 1
        observations.append(
            "HTF price is above EMA 21."
        )

    elif current_price < ema21:
        score -= 1
        observations.append(
            "HTF price is below EMA 21."
        )

    # Price relative to EMA 50
    if current_price > ema50:
        score += 1
        observations.append(
            "HTF price is above EMA 50."
        )

    elif current_price < ema50:
        score -= 1
        observations.append(
            "HTF price is below EMA 50."
        )

    # EMA alignment
    if ema21 > ema50:
        score += 2
        observations.append(
            "HTF EMA 21 is above EMA 50."
        )

    elif ema21 < ema50:
        score -= 2
        observations.append(
            "HTF EMA 21 is below EMA 50."
        )

    # Recent price structure
    if len(closes) >= 10:

        old_price = closes[-10]

        if current_price > old_price:
            score += 1
            observations.append(
                "Recent HTF price momentum is positive."
            )

        elif current_price < old_price:
            score -= 1
            observations.append(
                "Recent HTF price momentum is negative."
            )

    if score >= 4:
        bias = "BULLISH"
    elif score <= -4:
        bias = "BEARISH"
    else:
        bias = "NEUTRAL"

    strength = min(
        100,
        int((abs(score) / 5) * 100)
    )

    return {
        "status": "READY",
        "bias": bias,
        "strength": strength,
        "score": score,
        "current_price": current_price,
        "ema21": ema21,
        "ema50": ema50,
        "observations": observations
    }


if __name__ == "__main__":
    print("JTL ADVANCED HTF Bias Engine")
    print("Module loaded successfully.")
