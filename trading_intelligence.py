"""
JTL ADVANCED — Trading Intelligence Engine

Cross-platform decision-intelligence layer.

Designed to run on:
- Android / Termux
- Linux
- Windows
- Cloud Linux
- Render
- Docker

This module does NOT depend on MetaTrader 5.

It uses the existing Twelve Data market feed and
existing JTL analytical modules.

No simulated market prices are generated.
"""

from indicators import calculate_indicators
from analyst import analyze
from trend_analyst import analyze_trend
from trade_levels import calculate_trade_levels
from htf_bias import analyze_htf_bias


def build_trading_intelligence(market):
    """
    Build one unified JTL Trading Intelligence response
    from real market candles.
    """

    candles = market.get("candles", [])

    if not candles:
        raise ValueError(
            "No market candles were returned."
        )

    indicators = calculate_indicators(
        candles
    )

    analysis = analyze(
        indicators
    )

    trend = analyze_trend(
        candles
    )

    htf = analyze_htf_bias(
        candles
    )

    trade_levels = calculate_trade_levels(
        candles
    )

    return {
        "market": {
            "symbol": market.get("symbol"),
            "interval": market.get("interval"),
            "exchange": market.get("exchange"),
            "currency": market.get("currency"),
            "current_price": market.get("current_price"),
        },

        "indicators": indicators,

        "analysis": analysis,

        "trend": trend,

        "htf_bias": htf,

        "trade_levels": trade_levels,

        "engine": {
            "name": "JTL ADVANCED Trading Intelligence",
            "status": "CONNECTED",
            "mode": "ANALYSIS",
            "data_source": "Twelve Data",
            "execution": "DISABLED"
        }
    }
