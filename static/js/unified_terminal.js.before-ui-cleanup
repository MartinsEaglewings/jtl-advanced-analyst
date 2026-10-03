(function () {

    "use strict";

    let timer = null;

    function value(id, fallback = "—") {

        const el = document.getElementById(id);

        return el ? el.textContent = fallback : null;
    }


    function number(v) {

        if (
            v === null ||
            v === undefined ||
            v === ""
        ) {
            return "—";
        }

        const n = Number(v);

        if (!Number.isFinite(n)) {
            return "—";
        }

        return n.toLocaleString(
            undefined,
            {
                maximumFractionDigits: 4
            }
        );
    }


    function setStatus(id, text, connected = false) {

        const el = document.getElementById(id);

        if (!el) return;

        el.textContent = text;

        el.classList.toggle(
            "connected",
            connected
        );
    }


    function currentMarket() {

        const symbol =
            document.getElementById(
                "cryptoSelect"
            );

        const interval =
            document.getElementById(
                "interval"
            );

        return {
            symbol:
                symbol
                    ? symbol.value
                    : "BTC/USD",

            interval:
                interval
                    ? interval.value
                    : "1day"
        };
    }


    async function loadTerminal() {

        const market =
            currentMarket();

        try {

            const response =
                await fetch(
                    "/api/terminal" +
                    "?symbol=" +
                    encodeURIComponent(
                        market.symbol
                    ) +
                    "&interval=" +
                    encodeURIComponent(
                        market.interval
                    ),
                    {
                        cache: "no-store"
                    }
                );

            const data =
                await response.json();

            if (!response.ok ||
                !data.success) {

                throw new Error(
                    data.error ||
                    "Terminal API error."
                );
            }

            render(data.terminal);

            hideError();

        } catch (error) {

            console.error(
                "Unified Terminal:",
                error
            );

            showError(
                error.message
            );
        }
    }


    function render(data) {

        const market =
            data.market || {};

        const account =
            data.account || {};

        const connections =
            data.connections || {};

        const state =
            data.trade_state || {};

        const levels =
            data.trade_levels || {};


        value(
            "marketSymbol",
            market.symbol || "—"
        );


        value(
            "currentPrice",
            number(
                market.current_price
            )
        );


        value(
            "marketMeta",
            (
                market.exchange ||
                "MARKET DATA"
            ) +
            " • " +
            (
                market.interval ||
                ""
            )
        );


        /* ACCOUNT */

        value(
            "accountBalance",
            number(account.balance)
        );

        value(
            "accountEquity",
            number(account.equity)
        );

        value(
            "freeMargin",
            number(account.free_margin)
        );

        value(
            "usedMargin",
            number(account.used_margin)
        );

        value(
            "unrealizedPnl",
            number(account.unrealized_pnl)
        );

        value(
            "realizedPnl",
            number(account.realized_pnl)
        );


        /* CONNECTIONS */

        const mt5 =
            connections.mt5_ea || {};

        setStatus(
            "mt5Status",
            mt5.connected
                ? "CONNECTED"
                : "WAITING",
            mt5.connected
        );

        setStatus(
            "eaStatus",
            mt5.connected
                ? "CONNECTED"
                : "WAITING",
            mt5.connected
        );


        const td =
            connections.twelve_data || {};

        setStatus(
            "twelveStatus",
            td.status ||
            "UNKNOWN",
            !!td.connected
        );


        const flask =
            connections.flask || {};

        setStatus(
            "flaskStatus",
            flask.status ||
            "UNKNOWN",
            !!flask.connected
        );


        const tm =
            connections.trademux || {};

        setStatus(
            "trademuxStatus",
            tm.status ||
            "NOT CONNECTED",
            !!tm.connected
        );


        /* TRADE LEVELS */

        value(
            "terminalEntry",
            number(levels.entry_reference)
        );

        value(
            "terminalStop",
            number(levels.stop_loss)
        );

        value(
            "terminalTP1",
            number(levels.tp1)
        );

        value(
            "terminalTP2",
            number(levels.tp2)
        );

        value(
            "terminalTP3",
            number(levels.tp3)
        );


        /* TRADE STATE */

        value(
            "tradeState",
            state.state ||
            "WAITING"
        );

        value(
            "positionSymbol",
            state.symbol ||
            "—"
        );

        value(
            "positionDirection",
            state.direction ||
            "—"
        );

        value(
            "positionEntry",
            number(
                state.entry_price
            )
        );

        value(
            "positionId",
            state.broker_position_id ||
            "—"
        );


        /* POSITIONS */

        const positions =
            data.positions || [];

        const positionsBox =
            document.getElementById(
                "positionsContainer"
            );

        if (positionsBox) {

            if (!positions.length) {

                positionsBox.textContent =
                    mt5.connected
                        ? "No synchronized MT5 positions."
                        : "Waiting for MT5 EA synchronization.";

            } else {

                positionsBox.innerHTML =
                    positions.map(
                        position =>
                            "<div>" +
                            "<strong>" +
                            (
                                position.symbol ||
                                "—"
                            ) +
                            "</strong> " +
                            (
                                position.direction ||
                                "—"
                            ) +
                            " • Volume " +
                            (
                                position.volume ??
                                "—"
                            ) +
                            " • P/L " +
                            number(
                                position.unrealized_pnl
                            ) +
                            "</div>"
                    ).join("");
            }
        }


        /* ORDERS */

        const orders =
            data.orders || [];

        const ordersBox =
            document.getElementById(
                "ordersContainer"
            );

        if (ordersBox) {

            ordersBox.textContent =
                orders.length
                    ? `${orders.length} synchronized MT5 order(s).`
                    : (
                        mt5.connected
                            ? "No synchronized MT5 orders."
                            : "Waiting for MT5 EA synchronization."
                    );
        }


        /* FOOTER */

        value(
            "terminalTimestamp",
            data.timestamp
                ? new Date(
                    data.timestamp
                ).toLocaleTimeString()
                : "—"
        );


        const dot =
            document.getElementById(
                "connectionDot"
            );

        const text =
            document.getElementById(
                "connectionText"
            );

        if (dot) {

            dot.style.background =
                "#48d597";

            dot.style.color =
                "#48d597";
        }

        if (text) {
            text.textContent =
                "SYSTEM ONLINE";
        }
    }


    function showError(message) {

        const box =
            document.getElementById(
                "errorBox"
            );

        if (!box) return;

        box.textContent =
            "Terminal: " +
            message;

        box.classList.remove(
            "hidden"
        );
    }


    function hideError() {

        const box =
            document.getElementById(
                "errorBox"
            );

        if (box) {
            box.classList.add(
                "hidden"
            );
        }
    }


    function initialize() {

        loadTerminal();

        timer =
            setInterval(
                loadTerminal,
                10000
            );


        const analyze =
            document.getElementById(
                "analyzeButton"
            );

        if (analyze) {

            analyze.addEventListener(
                "click",
                function () {

                    loadTerminal();

                }
            );
        }


        const symbol =
            document.getElementById(
                "cryptoSelect"
            );

        const interval =
            document.getElementById(
                "interval"
            );

        if (symbol) {

            symbol.addEventListener(
                "change",
                loadTerminal
            );
        }

        if (interval) {

            interval.addEventListener(
                "change",
                loadTerminal
            );
        }
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();
