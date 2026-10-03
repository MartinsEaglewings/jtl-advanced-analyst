def sma(values, period):
    if len(values) < period:
        return None

    return sum(values[-period:]) / period


def ema(values, period):
    if len(values) < period:
        return None

    multiplier = 2 / (period + 1)

    current = sum(values[:period]) / period

    for price in values[period:]:
        current = (
            (price - current) * multiplier
        ) + current

    return current


def calculate_rsi(values, period=14):
    if len(values) <= period:
        return None

    gains = []
    losses = []

    for i in range(1, len(values)):
        change = values[i] - values[i - 1]

        if change > 0:
            gains.append(change)
            losses.append(0)
        else:
            gains.append(0)
            losses.append(abs(change))

    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period

    for i in range(period, len(gains)):
        avg_gain = (
            (avg_gain * (period - 1)) + gains[i]
        ) / period

        avg_loss = (
            (avg_loss * (period - 1)) + losses[i]
        ) / period

    if avg_loss == 0:
        return 100.0

    relative_strength = avg_gain / avg_loss

    return 100 - (100 / (1 + relative_strength))


def calculate_momentum(values, period=10):
    if len(values) <= period:
        return None

    return values[-1] - values[-period - 1]


def calculate_indicators(candles):
    closes = [c["close"] for c in candles]

    current_price = closes[-1]

    return {
        "price": current_price,
        "sma20": sma(closes, 20),
        "ema20": ema(closes, 20),
        "rsi14": calculate_rsi(closes, 14),
        "momentum10": calculate_momentum(closes, 10),
    }
