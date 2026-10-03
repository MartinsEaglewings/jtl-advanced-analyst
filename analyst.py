def analyze(indicators):
    score = 0
    observations = []

    price = indicators["price"]
    sma20 = indicators["sma20"]
    ema20 = indicators["ema20"]
    rsi = indicators["rsi14"]
    momentum = indicators["momentum10"]

    if sma20 is not None:
        if price > sma20:
            score += 1
            observations.append(
                "Price is above the 20-period SMA."
            )
        else:
            score -= 1
            observations.append(
                "Price is below the 20-period SMA."
            )

    if ema20 is not None:
        if price > ema20:
            score += 1
            observations.append(
                "Price is above the 20-period EMA."
            )
        else:
            score -= 1
            observations.append(
                "Price is below the 20-period EMA."
            )

    if rsi is not None:
        if rsi >= 70:
            observations.append(
                "RSI indicates potentially overbought conditions."
            )
        elif rsi <= 30:
            observations.append(
                "RSI indicates potentially oversold conditions."
            )
        elif rsi >= 50:
            score += 1
            observations.append(
                "RSI is above the midpoint."
            )
        else:
            score -= 1
            observations.append(
                "RSI is below the midpoint."
            )

    if momentum is not None:
        if momentum > 0:
            score += 1
            observations.append(
                "Recent momentum is positive."
            )
        elif momentum < 0:
            score -= 1
            observations.append(
                "Recent momentum is negative."
            )

    if score >= 3:
        condition = "POSITIVE TECHNICAL CONDITIONS"
    elif score <= -3:
        condition = "NEGATIVE TECHNICAL CONDITIONS"
    else:
        condition = "MIXED TECHNICAL CONDITIONS"

    return {
        "score": score,
        "condition": condition,
        "observations": observations,
    }
