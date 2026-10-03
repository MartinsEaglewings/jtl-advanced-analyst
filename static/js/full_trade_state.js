/*
 * JTL ADVANCED — Full Trade State Dashboard
 *
 * Independent interface.
 * Does not place, modify, or close trades.
 * Does not fabricate account or position data.
 */

(function () {
    "use strict";

    if (window.__jtlFullTradeStateLoaded) return;
    window.__jtlFullTradeStateLoaded = true;

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/static/css/full_trade_state.css?v=1";
    document.head.appendChild(css);

    let refreshTimer = null;
    let requestInProgress = false;

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function makeCard(label, value, extraClass) {
        const card = element("div", "jtl-fts-card");
        card.appendChild(element("div", "jtl-fts-label", label));
        card.appendChild(
            element("div", "jtl-fts-value " + (extraClass || "muted"), value)
        );
        return card;
    }

    function createDashboard() {
        if (document.getElementById("jtlFtsOverlay")) return;

        const overlay = element("div");
        overlay.id = "jtlFtsOverlay";

        const shell = element("div", "jtl-fts-shell");
        const header = element("header", "jtl-fts-header");
        const brandBlock = element("div");

        brandBlock.appendChild(
            element("div", "jtl-fts-brand", "JTL ADVANCED")
        );
        brandBlock.appendChild(
            element("div", "jtl-fts-subtitle",
                "FULL TRADE STATE MANAGEMENT"
            )
        );

        const exit = element("button", "jtl-fts-exit", "EXIT DASHBOARD");
        exit.type = "button";
        exit.addEventListener("click", closeDashboard);

        header.append(brandBlock, exit);

        const content = element("main", "jtl-fts-content");

        const notice = element(
            "div",
            "jtl-fts-notice",
            "BROKER STATUS: NOT CONNECTED. This dashboard will show real account and position data only after broker authentication and synchronization are implemented. No simulated trades or account figures are displayed."
        );
        notice.id = "jtlFtsNotice";
        content.appendChild(notice);

        const analysisControls = element(
            "section",
            "jtl-fts-analysis-controls"
        );

        const analyzeButton = element(
            "button",
            "jtl-fts-analyze",
            "ANALYZE LIVE STATE"
        );

        analyzeButton.type = "button";
        analyzeButton.id = "jtlFtsAnalyzeButton";

        analyzeButton.addEventListener(
            "click",
            function () {
                refreshState(true);
            }
        );

        analysisControls.appendChild(
            analyzeButton
        );

        const analysisStatus = element(
            "div",
            "jtl-fts-analysis-status",
            "Ready — press ANALYZE LIVE STATE to request real market information."
        );

        analysisStatus.id = "jtlFtsAnalysisStatus";

        analysisControls.appendChild(
            analysisStatus
        );

        content.appendChild(
            analysisControls
        );

        const marketPanel = element(
            "section",
            "jtl-fts-panel"
        );

        marketPanel.id = "jtlFtsMarketPanel";

        marketPanel.appendChild(
            element(
                "h3",
                "",
                "REAL-TIME MARKET INTELLIGENCE"
            )
        );

        const marketGrid = element(
            "div",
            "jtl-fts-grid"
        );

        marketGrid.id = "jtlFtsMarketGrid";

        marketPanel.appendChild(
            marketGrid
        );

        content.appendChild(
            marketPanel
        );

        const summary = element("section", "jtl-fts-grid");
        summary.id = "jtlFtsSummary";

        [
            ["Broker connection", "NOT CONNECTED"],
            ["Account equity", "UNAVAILABLE"],
            ["Open positions", "UNAVAILABLE"],
            ["Unrealized P/L", "UNAVAILABLE"],
            ["Free margin", "UNAVAILABLE"],
            ["Used margin", "UNAVAILABLE"],
            ["Active orders", "UNAVAILABLE"],
            ["State engine", "INITIALIZED"]
        ].forEach(function (item) {
            summary.appendChild(makeCard(item[0], item[1], "muted"));
        });

        content.appendChild(summary);

        const positionPanel = element("section", "jtl-fts-panel");
        positionPanel.appendChild(
            element("h3", "", "LIVE POSITION MONITOR")
        );

        const tableWrap = element("div", "jtl-fts-table-wrap");
        const table = element("table", "jtl-fts-table");
        const thead = element("thead");
        const headerRow = element("tr");

        [
            "SYMBOL", "SIDE", "ENTRY", "CURRENT",
            "STOP LOSS", "TAKE PROFIT", "P/L", "STATE"
        ].forEach(function (name) {
            headerRow.appendChild(element("th", "", name));
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = element("tbody");
        tbody.id = "jtlFtsPositions";

        const emptyRow = element("tr");
        const emptyCell = element(
            "td",
            "jtl-fts-empty",
            "Waiting for authenticated broker position data."
        );
        emptyCell.colSpan = 8;
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);

        table.appendChild(tbody);
        tableWrap.appendChild(table);
        positionPanel.appendChild(tableWrap);
        content.appendChild(positionPanel);

        const lifecycle = element("section", "jtl-fts-panel");
        lifecycle.appendChild(
            element("h3", "", "TRADE LIFECYCLE")
        );

        const lifecycleGrid = element("div", "jtl-fts-grid");
        [
            ["Current state", "WAITING"],
            ["Broker position ID", "UNAVAILABLE"],
            ["Trade duration", "UNAVAILABLE"],
            ["Last synchronization", "NOT STARTED"]
        ].forEach(function (item) {
            lifecycleGrid.appendChild(makeCard(item[0], item[1], "muted"));
        });

        lifecycle.appendChild(lifecycleGrid);
        content.appendChild(lifecycle);

        const eventPanel = element("section", "jtl-fts-panel");
        eventPanel.appendChild(
            element("h3", "", "TRADE EVENT HISTORY")
        );

        const events = element("div", "jtl-fts-events");
        events.id = "jtlFtsEvents";
        events.appendChild(
            element(
                "div",
                "jtl-fts-event",
                "No broker events received. Event history will populate when live synchronization is connected."
            )
        );

        eventPanel.appendChild(events);
        content.appendChild(eventPanel);

        const footer = element(
            "footer",
            "jtl-fts-footer",
            "MONITORING INTERFACE ONLY · AUTOMATIC EXECUTION DISABLED · Broker-confirmed data is required before real-time position monitoring can be enabled."
        );

        shell.append(header, content, footer);
        overlay.appendChild(shell);
        document.body.appendChild(overlay);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeDashboard();
        });

        document.addEventListener("keydown", function (event) {
            if (
                event.key === "Escape" &&
                overlay.classList.contains("jtl-fts-open")
            ) {
                closeDashboard();
            }
        });
    }

    function openDashboard() {
        createDashboard();

        const overlay = document.getElementById("jtlFtsOverlay");
        overlay.classList.add("jtl-fts-open");
        document.body.style.overflow = "hidden";

        refreshState(true);

        if (refreshTimer) clearInterval(refreshTimer);
        refreshTimer = setInterval(
            function () {
                refreshState(false);
            },
            5000
        );
    }

    function closeDashboard() {
        const overlay = document.getElementById("jtlFtsOverlay");
        if (overlay) overlay.classList.remove("jtl-fts-open");

        document.body.style.overflow = "";

        if (refreshTimer) {
            clearInterval(refreshTimer);
            refreshTimer = null;
        }
    }

    async function refreshState(manual) {

        if (requestInProgress) return;

        requestInProgress = true;

        const button =
            document.getElementById(
                "jtlFtsAnalyzeButton"
            );

        const status =
            document.getElementById(
                "jtlFtsAnalysisStatus"
            );

        if (button) {
            button.disabled = true;
            button.textContent = "ANALYZING LIVE DATA...";
        }

        if (status) {
            status.textContent =
                "Requesting fresh Twelve Data market information...";
        }

        try {

            const response = await fetch(
                "/api/full-trade-state?symbol=BTC%2FUSD&interval=1day",
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    },
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Backend request failed (HTTP " +
                    response.status +
                    ")."
                );
            }

            const data =
                await response.json();

            if (
                !data ||
                data.success !== true
            ) {
                throw new Error(
                    data && data.error
                        ? data.error
                        : "Live state is unavailable."
                );
            }

            renderState(data);
            renderMarketIntelligence(data);

            if (status) {
                status.textContent =
                    "LIVE ANALYSIS COMPLETE · " +
                    (
                        data.market &&
                        data.market.symbol
                            ? data.market.symbol
                            : "MARKET"
                    ) +
                    " · " +
                    (
                        data.market &&
                        data.market.interval
                            ? data.market.interval
                            : "TIMEFRAME"
                    ) +
                    " · " +
                    new Date().toLocaleTimeString();
            }

        } catch (error) {

            const notice =
                document.getElementById(
                    "jtlFtsNotice"
                );

            if (notice) {
                notice.textContent =
                    "LIVE DATA UNAVAILABLE: " +
                    error.message +
                    " No account balances, positions, or broker values are being fabricated.";
            }

            if (status) {
                status.textContent =
                    "ANALYSIS FAILED · " +
                    error.message;
            }

        } finally {

            if (button) {
                button.disabled = false;
                button.textContent =
                    "ANALYZE LIVE STATE";
            }

            requestInProgress = false;
        }
    }


    function renderMarketIntelligence(data) {

        const grid =
            document.getElementById(
                "jtlFtsMarketGrid"
            );

        if (!grid) return;

        const market =
            data.market || {};

        const indicators =
            data.indicators || {};

        const analysis =
            data.analysis || {};

        const trend =
            data.trend || {};

        const htf =
            data.htf_bias || {};

        const levels =
            data.trade_levels || {};

        grid.replaceChildren();

        const cards = [

            [
                "SYMBOL",
                market.symbol || "—"
            ],

            [
                "CURRENT PRICE",
                market.current_price ?? "—"
            ],

            [
                "TIMEFRAME",
                market.interval || "—"
            ],

            [
                "EXCHANGE",
                market.exchange || "—"
            ],

            [
                "RSI 14",
                indicators.rsi14 ?? "—"
            ],

            [
                "SMA 20",
                indicators.sma20 ?? "—"
            ],

            [
                "EMA 20",
                indicators.ema20 ?? "—"
            ],

            [
                "MOMENTUM 10",
                indicators.momentum10 ?? "—"
            ],

            [
                "ANALYST CONDITION",
                analysis.condition ||
                analysis.status ||
                "AVAILABLE"
            ],

            [
                "ANALYST SCORE",
                analysis.score ??
                "—"
            ],

            [
                "TREND",
                trend.direction ||
                trend.trend ||
                "—"
            ],

            [
                "TREND STRENGTH",
                trend.strength !== undefined
                    ? String(trend.strength) + "%"
                    : "—"
            ],

            [
                "TREND CONFIDENCE",
                trend.confidence ??
                "—"
            ],

            [
                "HTF BIAS",
                htf.bias ||
                htf.direction ||
                htf.status ||
                "—"
            ],

            [
                "ENTRY",
                levels.entry ??
                levels.entry_price ??
                "—"
            ],

            [
                "STOP LOSS",
                levels.stop_loss ??
                "—"
            ],

            [
                "TAKE PROFIT",
                levels.take_profit ??
                "—"
            ]

        ];

        cards.forEach(function (item) {

            grid.appendChild(
                makeCard(
                    item[0],
                    String(item[1]),
                    "muted"
                )
            );

        });
    }

    function renderState(data) {
        const notice = document.getElementById("jtlFtsNotice");
        const state = data.state || {};
        const broker = data.broker || {};
        const account = data.account || {};
        const positions = Array.isArray(data.positions)
            ? data.positions
            : [];

        if (notice) {
            notice.textContent = broker.connected
                ? "BROKER CONNECTION: CONNECTED. Displayed values are supplied by the backend; verify account synchronization before relying on them."
                : "BROKER STATUS: NOT CONNECTED. Live account and position data are unavailable.";
        }

        const values = [
            ["Broker connection", broker.connected ? "CONNECTED" : "NOT CONNECTED"],
            ["Account equity", account.equity ?? "UNAVAILABLE"],
            ["Open positions", broker.connected ? String(positions.length) : "UNAVAILABLE"],
            ["Unrealized P/L", account.unrealized_pnl ?? "UNAVAILABLE"],
            ["Free margin", account.free_margin ?? "UNAVAILABLE"],
            ["Used margin", account.used_margin ?? "UNAVAILABLE"],
            ["Active orders", broker.connected && Array.isArray(data.orders) ? String(data.orders.length) : "UNAVAILABLE"],
            ["State engine", state.state || "INITIALIZED"]
        ];

        const summary = document.getElementById("jtlFtsSummary");
        if (summary) {
            summary.replaceChildren();
            values.forEach(function (item) {
                summary.appendChild(makeCard(
                    item[0],
                    String(item[1]),
                    item[0] === "Broker connection" && broker.connected
                        ? "gold"
                        : "muted"
                ));
            });
        }

        const tbody = document.getElementById("jtlFtsPositions");
        if (tbody) {
            tbody.replaceChildren();

            if (!broker.connected || positions.length === 0) {
                const row = element("tr");
                const cell = element(
                    "td",
                    "jtl-fts-empty",
                    broker.connected
                        ? "No open positions were reported by the broker."
                        : "Waiting for authenticated broker position data."
                );
                cell.colSpan = 8;
                row.appendChild(cell);
                tbody.appendChild(row);
            } else {
                positions.forEach(function (position) {
                    const row = element("tr");
                    [
                        position.symbol,
                        position.side,
                        position.entry_price,
                        position.current_price,
                        position.stop_loss,
                        position.take_profit,
                        position.unrealized_pnl,
                        position.state
                    ].forEach(function (value) {
                        row.appendChild(
                            element(
                                "td",
                                "",
                                value === null || value === undefined
                                    ? "—"
                                    : String(value)
                            )
                        );
                    });
                    tbody.appendChild(row);
                });
            }
        }

        const lifecycle = document.querySelector(
            "#jtlFtsOverlay .jtl-fts-panel:nth-of-type(2) .jtl-fts-grid"
        );

        if (lifecycle) {
            const lifeValues = [
                ["Current state", state.state || "WAITING"],
                ["Broker position ID", state.broker_position_id ?? "UNAVAILABLE"],
                ["Trade duration", state.duration_seconds !== undefined
                    ? String(state.duration_seconds) + " sec"
                    : "UNAVAILABLE"],
                ["Last synchronization", data.last_sync || "NOT STARTED"]
            ];

            lifecycle.replaceChildren();
            lifeValues.forEach(function (item) {
                lifecycle.appendChild(makeCard(item[0], item[1], "muted"));
            });
        }

        const events = document.getElementById("jtlFtsEvents");
        if (events) {
            events.replaceChildren();

            const eventList = Array.isArray(data.events) ? data.events : [];

            if (!eventList.length) {
                events.appendChild(
                    element(
                        "div",
                        "jtl-fts-event",
                        "No trade events have been reported."
                    )
                );
            } else {
                eventList.slice(-30).reverse().forEach(function (item) {
                    events.appendChild(
                        element(
                            "div",
                            "jtl-fts-event",
                            [
                                item.timestamp || "",
                                item.from ? item.from + " → " : "",
                                item.to || item.event || "EVENT",
                                item.reason ? " — " + item.reason : ""
                            ].join("")
                        )
                    );
                });
            }
        }
    }

    function installLaunchButton() {

        const button =
            document.querySelector(".jtl-fts-launch");

        if (!button) {
            return;
        }

        if (button.dataset.ftsBound === "true") {
            return;
        }

        button.dataset.ftsBound = "true";

        button.addEventListener(
            "click",
            openDashboard
        );

        /*
         * Keep the three dashboard controls together:
         *
         * TRADE LEVELS
         * MT5 EA
         * FULL TRADE STATE
         */

        const mt5Button =
            document.querySelector(".jtl-mt5-launch");

        if (mt5Button && button.parentElement !== mt5Button.parentElement) {
            mt5Button.insertAdjacentElement(
                "afterend",
                button
            );
        }
    }

    window.openFullTradeState = openDashboard;

    function start() {
        installLaunchButton();

        // Retry briefly in case the existing page creates its controls later.
        let attempts = 0;
        const retry = setInterval(function () {
            installLaunchButton();
            attempts += 1;
            if (attempts >= 10 || document.querySelector(".jtl-fts-launch")) {
                clearInterval(retry);
            }
        }, 500);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();
