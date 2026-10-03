"""
JTL ADVANCED — Full Trade State Management

Tracks the complete lifecycle of a trade.

This module does NOT generate fake broker data.
It stores and manages state only.

Broker synchronization will be connected separately.
"""

from datetime import datetime, timezone


TRADE_STATES = (
    "WAITING",
    "SETUP",
    "ENTRY_REQUESTED",
    "ORDER_ACCEPTED",
    "OPEN",
    "MANAGING",
    "PARTIAL_CLOSE",
    "CLOSED",
    "REJECTED",
)


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def create_trade_state():
    return {
        "state": "WAITING",

        "trade_id": None,
        "symbol": None,
        "direction": None,

        "entry_price": None,
        "current_price": None,

        "stop_loss": None,
        "take_profit": None,

        "quantity": None,

        "balance": None,
        "equity": None,
        "free_margin": None,
        "used_margin": None,

        "unrealized_pnl": None,
        "realized_pnl": None,

        "risk_amount": None,
        "risk_percent": None,

        "opened_at": None,
        "closed_at": None,

        "duration_seconds": 0,

        "broker_position_id": None,
        "broker_order_id": None,

        "last_update": utc_now(),

        "execution": {
            "enabled": False,
            "broker_connected": False,
            "broker_confirmed": False,
        },

        "events": [],
    }


def transition(state, new_state, reason=None):
    if new_state not in TRADE_STATES:
        raise ValueError(
            f"Invalid trade state: {new_state}"
        )

    old_state = state.get("state")

    state["state"] = new_state
    state["last_update"] = utc_now()

    state.setdefault("events", []).append({
        "timestamp": state["last_update"],
        "from": old_state,
        "to": new_state,
        "reason": reason,
    })

    return state


def update_market_state(
    state,
    current_price=None,
    unrealized_pnl=None,
):
    if current_price is not None:
        state["current_price"] = current_price

    if unrealized_pnl is not None:
        state["unrealized_pnl"] = unrealized_pnl

    if state.get("opened_at"):
        try:
            opened = datetime.fromisoformat(
                state["opened_at"]
            )

            now = datetime.now(timezone.utc)

            state["duration_seconds"] = max(
                0,
                int((now - opened).total_seconds())
            )

        except (ValueError, TypeError):
            state["duration_seconds"] = 0

    state["last_update"] = utc_now()

    return state


def open_trade(
    state,
    trade_id,
    symbol,
    direction,
    entry_price,
    quantity,
    stop_loss=None,
    take_profit=None,
):
    state["trade_id"] = trade_id
    state["symbol"] = symbol
    state["direction"] = direction

    state["entry_price"] = entry_price
    state["quantity"] = quantity

    state["stop_loss"] = stop_loss
    state["take_profit"] = take_profit

    state["opened_at"] = utc_now()
    state["closed_at"] = None

    transition(
        state,
        "OPEN",
        "Broker-confirmed position opened."
    )

    return state


def close_trade(
    state,
    exit_price=None,
    realized_pnl=None,
    reason=None,
):
    if exit_price is not None:
        state["current_price"] = exit_price

    if realized_pnl is not None:
        state["realized_pnl"] = realized_pnl

    state["closed_at"] = utc_now()

    transition(
        state,
        "CLOSED",
        reason or "Trade closed."
    )

    return state


def broker_reconcile(
    state,
    broker_connected,
    broker_position_id=None,
):
    state["execution"]["broker_connected"] = bool(
        broker_connected
    )

    state["broker_position_id"] = broker_position_id

    state["execution"]["broker_confirmed"] = bool(
        broker_connected and broker_position_id
    )

    state["last_update"] = utc_now()

    return state


def dashboard_state(state):
    """
    Return a safe dashboard representation.

    No credentials or secrets are included.
    """

    return {
        "state": state.get("state"),
        "trade_id": state.get("trade_id"),
        "symbol": state.get("symbol"),
        "direction": state.get("direction"),

        "entry_price": state.get("entry_price"),
        "current_price": state.get("current_price"),

        "stop_loss": state.get("stop_loss"),
        "take_profit": state.get("take_profit"),

        "quantity": state.get("quantity"),

        "balance": state.get("balance"),
        "equity": state.get("equity"),
        "free_margin": state.get("free_margin"),
        "used_margin": state.get("used_margin"),

        "unrealized_pnl": state.get("unrealized_pnl"),
        "realized_pnl": state.get("realized_pnl"),

        "risk_amount": state.get("risk_amount"),
        "risk_percent": state.get("risk_percent"),

        "opened_at": state.get("opened_at"),
        "closed_at": state.get("closed_at"),

        "duration_seconds": state.get(
            "duration_seconds",
            0
        ),

        "broker_position_id": state.get(
            "broker_position_id"
        ),

        "last_update": state.get(
            "last_update"
        ),

        "execution": state.get(
            "execution",
            {}
        ),

        "events": state.get(
            "events",
            []
        ),
    }
