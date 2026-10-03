"""
JTL ADVANCED — Unified Terminal State

Combines the existing JTL market intelligence with
the synchronized MT5 broker state.

No broker values are invented.
"""

from datetime import datetime, timezone


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def build_terminal_state(
    intelligence,
    trade_state,
    mt5_sync_received=False,
    trademux_connected=False
):
    execution = trade_state.get("execution", {})

    mt5_connected = bool(
        execution.get("broker_connected", False)
    )

    mt5_confirmed = bool(
        execution.get("broker_confirmed", False)
    )

    account = {
        "available": mt5_sync_received and mt5_connected,
        "balance": trade_state.get("balance"),
        "equity": trade_state.get("equity"),
        "free_margin": trade_state.get("free_margin"),
        "used_margin": trade_state.get("used_margin"),
        "unrealized_pnl": trade_state.get("unrealized_pnl"),
        "realized_pnl": trade_state.get("realized_pnl"),
    }

    positions = []

    position_id = trade_state.get(
        "broker_position_id"
    )

    if mt5_sync_received and position_id:
        positions.append({
            "ticket": position_id,
            "symbol": trade_state.get("symbol"),
            "direction": trade_state.get("direction"),
            "volume": trade_state.get("quantity"),
            "entry_price": trade_state.get("entry_price"),
            "current_price": trade_state.get("current_price"),
            "stop_loss": trade_state.get("stop_loss"),
            "take_profit": trade_state.get("take_profit"),
            "unrealized_pnl":
                trade_state.get("unrealized_pnl"),
        })

    return {
        "timestamp": utc_now(),

        "market": intelligence.get(
            "market", {}
        ),

        "indicators": intelligence.get(
            "indicators", {}
        ),

        "analysis": intelligence.get(
            "analysis", {}
        ),

        "trend": intelligence.get(
            "trend", {}
        ),

        "htf_bias": intelligence.get(
            "htf_bias", {}
        ),

        "trade_levels": intelligence.get(
            "trade_levels", {}
        ),

        "account": account,

        "positions": positions,

        "orders": [],

        "trade_state": {
            "state": trade_state.get("state"),
            "trade_id": trade_state.get("trade_id"),
            "symbol": trade_state.get("symbol"),
            "direction": trade_state.get("direction"),
            "entry_price": trade_state.get("entry_price"),
            "current_price": trade_state.get("current_price"),
            "stop_loss": trade_state.get("stop_loss"),
            "take_profit": trade_state.get("take_profit"),
            "quantity": trade_state.get("quantity"),
            "unrealized_pnl":
                trade_state.get("unrealized_pnl"),
            "broker_position_id":
                trade_state.get("broker_position_id"),
            "last_update":
                trade_state.get("last_update"),
            "events":
                trade_state.get("events", []),
        },

        "connections": {
            "twelve_data": {
                "connected": True,
                "status": "CONNECTED",
                "source": "Twelve Data",
            },

            "flask": {
                "connected": True,
                "status": "CONNECTED",
            },

            "mt5_ea": {
                "connected": mt5_connected,
                "confirmed": mt5_confirmed,
                "synchronized": mt5_sync_received,
                "status": (
                    "CONNECTED"
                    if mt5_connected
                    else "WAITING"
                ),
            },

            "trademux": {
                "connected": bool(
                    trademux_connected
                ),
                "status": (
                    "CONNECTED"
                    if trademux_connected
                    else "NOT CONNECTED"
                ),
            },

            "execution": {
                "enabled": False,
                "status": "DISABLED",
            },
        },

        "engine": {
            "name":
                "JTL ADVANCED Unified Terminal",

            "status": "CONNECTED",

            "mode": "ANALYSIS",

            "market_data":
                "Twelve Data",

            "broker_data":
                "MT5 EA",

            "execution":
                "DISABLED",
        },
    }
