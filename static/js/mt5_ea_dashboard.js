/* =========================================
   JTL ADVANCED — MT5 EA DASHBOARD
   LIVE ANALYSIS DASHBOARD
   ========================================= */

(function () {

    if (window.JTL_MT5_EA_LOADED_V2) {
        return;
    }

    window.JTL_MT5_EA_LOADED_V2 = true;

    const css = document.createElement("link");

    css.rel = "stylesheet";
    css.href = "/static/css/mt5_ea_dashboard.css?v=3";

    document.head.appendChild(css);


    const launchButton = document.createElement("button");

    launchButton.className = "jtl-mt5-launch";
    launchButton.type = "button";
    launchButton.textContent = "JTL ADVANCED MT5 EA";


    const tradeButton =
        document.querySelector("#tlOpenButton") ||
        document.querySelector(".tl-open-button") ||
        document.querySelector(".jtl-trade-levels-launch") ||
        document.querySelector("#tradeLevelsButton");

    if (tradeButton) {

        tradeButton.insertAdjacentElement(
            "afterend",
            launchButton
        );

    } else {

        document.body.appendChild(
            launchButton
        );

    }


    const overlay =
        document.createElement("div");

    overlay.className =
        "jtl-mt5-overlay";


    overlay.innerHTML = `

        <div class="jtl-mt5-dashboard">

            <div class="jtl-mt5-header">

                <div>

                    <h2 class="jtl-mt5-title">
                        JTL ADVANCED MT5 EA
                    </h2>

                    <p class="jtl-mt5-subtitle">
                        Multi-market Expert Advisor dashboard
                    </p>

                </div>

                <button
                    type="button"
                    class="jtl-mt5-exit"
                    id="jtlMt5Exit"
                >
                    ×
                </button>

            </div>


            <!-- ANALYSIS CONTROLS -->

            <section class="jtl-mt5-card full">

                <h3>EA MARKET ANALYSIS</h3>

                <div
                    style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                2,
                                minmax(0,1fr)
                            );
                        gap:10px;
                        margin-bottom:12px;
                    "
                >

                    <select
                        id="mt5EaSymbol"
                        style="
                            width:100%;
                            padding:12px;
                            border-radius:10px;
                            border:1px solid
                                rgba(212,175,55,.35);
                            background:#230000;
                            color:#f4d35e;
                        "
                    >

                        <option value="BTC/USD">
                            BTC/USD — Bitcoin
                        </option>

                        <option value="ETH/USD">
                            ETH/USD — Ethereum
                        </option>

                        <option value="XRP/USD">
                            XRP/USD — XRP
                        </option>

                        <option value="SOL/USD">
                            SOL/USD — Solana
                        </option>

                    </select>


                    <select
                        id="mt5EaInterval"
                        style="
                            width:100%;
                            padding:12px;
                            border-radius:10px;
                            border:1px solid
                                rgba(212,175,55,.35);
                            background:#230000;
                            color:#f4d35e;
                        "
                    >

                        <option value="1min">
                            1 Minute
                        </option>

                        <option value="5min">
                            5 Minutes
                        </option>

                        <option value="15min">
                            15 Minutes
                        </option>

                        <option value="30min">
                            30 Minutes
                        </option>

                        <option value="1h">
                            1 Hour
                        </option>

                        <option value="4h">
                            4 Hours
                        </option>

                        <option value="1day">
                            1 Day
                        </option>

                    </select>

                </div>


                <button
                    type="button"
                    id="mt5AnalyzeButton"
                    style="
                        width:100%;
                        padding:14px;
                        border-radius:12px;
                        border:1px solid
                            rgba(212,175,55,.55);
                        background:
                            linear-gradient(
                                135deg,
                                #650000,
                                #300000
                            );
                        color:#f4d35e;
                        font-weight:900;
                        letter-spacing:1px;
                        cursor:pointer;
                    "
                >
                    ANALYZE MARKET
                </button>


                <div
                    id="mt5AnalyzeMessage"
                    style="
                        margin-top:10px;
                        text-align:center;
                        font-size:.78rem;
                        opacity:.75;
                    "
                >
                    Select a market and press
                    ANALYZE MARKET.
                </div>

            </section>


            <div class="jtl-mt5-status">

                <span
                    class="jtl-mt5-badge"
                    id="mt5MarketStatus"
                >
                    MARKET DATA: WAITING
                </span>

                <span class="jtl-mt5-badge">
                    MT5 BRIDGE: NOT CONNECTED
                </span>

                <span class="jtl-mt5-badge">
                    EXECUTION: DISABLED
                </span>

            </div>


            <div class="jtl-mt5-grid">


                <section class="jtl-mt5-card">

                    <h3>MARKET</h3>

                    <div class="jtl-mt5-row">
                        <span>Symbol</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Symbol"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Timeframe</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Timeframe"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Exchange</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Exchange"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Currency</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Currency"
                        >—</span>
                    </div>

                </section>


                <section class="jtl-mt5-card">

                    <h3>LIVE MARKET INFORMATION</h3>

                    <div class="jtl-mt5-row">
                        <span>Current Price</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Price"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Condition</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Condition"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Last Analysis</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5LastUpdate"
                        >—</span>
                    </div>

                </section>


                <section class="jtl-mt5-card">

                    <h3>TREND ANALYST</h3>

                    <div class="jtl-mt5-row">
                        <span>Trend</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Trend"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Direction</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Direction"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Strength</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Strength"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Score</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5TrendScore"
                        >—</span>
                    </div>

                </section>


                <section class="jtl-mt5-card">

                    <h3>INDICATORS</h3>

                    <div class="jtl-mt5-row">
                        <span>RSI</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5RSI"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>SMA 20</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5SMA"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>EMA 20</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5EMA"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Momentum</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Momentum"
                        >—</span>
                    </div>

                </section>


                <section class="jtl-mt5-card">

                    <h3>CONFLUENCE</h3>

                    <div class="jtl-mt5-row">
                        <span>Technical Score</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Score"
                        >—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Analysis Status</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5Signal"
                        >WAIT</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>HTF Bias</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5HTFBias"
                        >
                            —
                        </span>
                    </div>

                </section>


                <section class="jtl-mt5-card">

                    <h3>ADVANCED STRUCTURE</h3>

                    <div class="jtl-mt5-row">
                        <span>Liquidity</span>
                        <span
                            class="jtl-mt5-value"
                        >
                            NOT YET IMPLEMENTED
                        </span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Liquidity Sweep</span>
                        <span
                            class="jtl-mt5-value"
                        >
                            NOT YET IMPLEMENTED
                        </span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>BOS / CHoCH</span>
                        <span
                            class="jtl-mt5-value"
                        >
                            NOT YET IMPLEMENTED
                        </span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Order Block</span>
                        <span
                            class="jtl-mt5-value"
                        >
                            NOT YET IMPLEMENTED
                        </span>
                    </div>

                </section>


                <section class="jtl-mt5-card full">

                    <h3>MT5 EXECUTION CONNECTION</h3>

                    <div class="jtl-mt5-check">
                        <span>MARKET DATA</span>
                        <span id="checkMarket">—</span>
                    </div>

                    <div class="jtl-mt5-check">
                        <span>MT5 CONNECTION</span>
                        <span>✕ NOT CONNECTED</span>
                    </div>

                    <div class="jtl-mt5-check">
                        <span>BROKER BID / ASK</span>
                        <span>NOT AVAILABLE</span>
                    </div>

                    <div class="jtl-mt5-check">
                        <span>BROKER SPREAD</span>
                        <span>NOT AVAILABLE</span>
                    </div>

                    <div class="jtl-mt5-check">
                        <span>MARGIN</span>
                        <span>NOT AVAILABLE</span>
                    </div>

                </section>


                <section class="jtl-mt5-card full">

                    <h3>TRADE STATE</h3>

                    <div class="jtl-mt5-row">
                        <span>State</span>
                        <span
                            class="jtl-mt5-value"
                            id="mt5TradeState"
                        >
                            WAIT
                        </span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Entry</span>
                        <span class="jtl-mt5-value">—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>Stop Loss</span>
                        <span class="jtl-mt5-value">—</span>
                    </div>

                    <div class="jtl-mt5-row">
                        <span>TP1 / TP2 / TP3</span>
                        <span class="jtl-mt5-value">— / — / —</span>
                    </div>

                </section>

            </div>


            <div class="jtl-mt5-warning">

                Real market information is only loaded after
                ANALYZE MARKET is pressed.

                MT5 broker information remains unavailable until
                the real MQL5 Expert Advisor and MT5 bridge are
                connected.

            </div>


            <div class="jtl-mt5-controls">

                <button
                    type="button"
                    class="jtl-mt5-control"
                    disabled
                >
                    CONNECT MT5
                </button>

                <button
                    type="button"
                    class="jtl-mt5-control"
                    disabled
                >
                    ARM EA
                </button>

                <button
                    type="button"
                    class="jtl-mt5-control"
                    id="jtlMt5ExitBottom"
                >
                    EXIT DASHBOARD
                </button>

            </div>

        </div>
    `;


    document.body.appendChild(overlay);


    const analyzeButton =
        document.getElementById(
            "mt5AnalyzeButton"
        );


    const symbolSelect =
        document.getElementById(
            "mt5EaSymbol"
        );


    const intervalSelect =
        document.getElementById(
            "mt5EaInterval"
        );


    const message =
        document.getElementById(
            "mt5AnalyzeMessage"
        );


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value === null ||
                value === undefined ||
                value === ""
                    ? "—"
                    : String(value);
        }

    }


    function number(value, digits = 2) {

        const n =
            Number(value);

        if (!Number.isFinite(n)) {
            return "—";
        }

        return n.toLocaleString(
            undefined,
            {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            }
        );

    }


    function clearResults() {

        const ids = [

            "mt5Symbol",
            "mt5Timeframe",
            "mt5Exchange",
            "mt5Currency",
            "mt5Price",
            "mt5Condition",
            "mt5LastUpdate",
            "mt5Trend",
            "mt5Direction",
            "mt5Strength",
            "mt5TrendScore",
            "mt5RSI",
            "mt5SMA",
            "mt5EMA",
            "mt5Momentum",
            "mt5Score"

        ];

        ids.forEach(
            id => setText(id, "—")
        );

        setText(
            "mt5Signal",
            "WAIT"
        );

        setText(
            "mt5TradeState",
            "WAIT"
        );

        setText(
            "checkMarket",
            "—"
        );

    }


    async function analyzeMarket() {

        const symbol =
            symbolSelect.value;

        const interval =
            intervalSelect.value;


        analyzeButton.disabled = true;

        analyzeButton.textContent =
            "ANALYZING...";


        message.textContent =
            "Requesting fresh Twelve Data market information...";


        setText(
            "mt5MarketStatus",
            "MARKET DATA: ANALYZING"
        );


        clearResults();


        try {

            const url =
                "/api/mt5-ea-status" +
                "?symbol=" +
                encodeURIComponent(symbol) +
                "&interval=" +
                encodeURIComponent(interval) +
                "&_=" +
                Date.now();


            const response =
                await fetch(
                    url,
                    {
                        method: "GET",
                        cache: "no-store",
                        headers: {
                            "Cache-Control":
                                "no-cache"
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok ||
                !data.success) {

                throw new Error(
                    data.error ||
                    "Market analysis failed."
                );

            }


            const market =
                data.market || {};

            const indicators =
                data.indicators || {};

            const analysis =
                data.analysis || {};

            const trend =
                data.trend || {};


            setText(
                "mt5Symbol",
                market.symbol
            );

            setText(
                "mt5Timeframe",
                market.interval
            );

            setText(
                "mt5Exchange",
                market.exchange
            );

            setText(
                "mt5Currency",
                market.currency
            );


            setText(
                "mt5Price",
                number(
                    market.current_price,
                    2
                )
            );


            setText(
                "mt5Condition",
                analysis.condition
            );


            setText(
                "mt5Trend",
                trend.trend
            );

            setText(
                "mt5Direction",
                trend.direction
            );


            setText(
                "mt5Strength",
                trend.strength !== undefined
                    ? number(
                        trend.strength,
                        0
                    ) + "%"
                    : "—"
            );


            setText(
                "mt5TrendScore",
                trend.score
            );


            setText(
                "mt5RSI",
                number(
                    indicators.rsi,
                    2
                )
            );


            setText(
                "mt5SMA",
                number(
                    indicators.sma20,
                    2
                )
            );


            setText(
                "mt5EMA",
                number(
                    indicators.ema20,
                    2
                )
            );


            setText(
                "mt5Momentum",
                number(
                    indicators.momentum10,
                    2
                )
            );


            setText(
                "mt5Score",
                analysis.score
            );


            setText(
                "mt5Signal",
                analysis.condition ||
                "ANALYZED"
            );


            setText(
                "mt5TradeState",
                "WAIT"
            );


            setText(
                "mt5LastUpdate",
                new Date()
                    .toLocaleTimeString()
            );


            setText(
                "checkMarket",
                "✓ CONNECTED"
            );


            const htfIntervalMap = {
                "1min": "15min",
                "5min": "1h",
                "15min": "1h",
                "30min": "4h",
                "45min": "4h",
                "1h": "4h",
                "2h": "8h",
                "4h": "1day",
                "8h": "1day",
                "1day": "1week",
                "1week": "1month",
                "1month": "1month"
            };

            const htfInterval =
                htfIntervalMap[interval] || "4h";

            await loadJTLHTFBias(
                symbol,
                htfInterval
            );


            setText(
                "mt5MarketStatus",
                "MARKET DATA: CONNECTED"
            );


            message.textContent =
                "Real market analysis loaded successfully.";


        } catch (error) {

            console.error(
                "JTL MT5 EA analysis error:",
                error
            );


            setText(
                "mt5MarketStatus",
                "MARKET DATA: ERROR"
            );


            setText(
                "checkMarket",
                "✕"
            );


            message.textContent =
                "Analysis failed: " +
                error.message;

        } finally {

            analyzeButton.disabled =
                false;

            analyzeButton.textContent =
                "ANALYZE MARKET";

        }

    }


    analyzeButton.addEventListener(
        "click",
        analyzeMarket
    );


    function openDashboard() {

        overlay.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }


    function closeDashboard() {

        overlay.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";

    }


    launchButton.addEventListener(
        "click",
        openDashboard
    );


    document
        .getElementById("jtlMt5Exit")
        .addEventListener(
            "click",
            closeDashboard
        );


    document
        .getElementById("jtlMt5ExitBottom")
        .addEventListener(
            "click",
            closeDashboard
        );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {
                closeDashboard();
            }

        }
    );


})();


/* =========================================================
   JTL ADVANCED — HTF BIAS FRONTEND
   ========================================================= */

async function loadJTLHTFBias(symbol, interval) {

    try {

        const response = await fetch(
            `/api/mt5-htf-bias?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&_=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.error || "HTF Bias analysis failed."
            );
        }

        renderJTLHTFBias(data.htf_bias);

        const bias = data.htf_bias || {};

        setText(
            "mt5HTFBias",
            bias.status === "READY"
                ? `${bias.bias} (${bias.strength ?? 0}%)`
                : (bias.status || "UNAVAILABLE")
        );

    } catch (error) {

        setText(
            "mt5HTFBias",
            "UNAVAILABLE"
        );

        renderJTLHTFBiasError(
            error.message
        );
    }
}


function renderJTLHTFBias(bias) {

    let panel = document.getElementById(
        "jtl-htf-bias-panel"
    );

    if (!panel) {

        panel = document.createElement("div");

        panel.id = "jtl-htf-bias-panel";

        panel.className =
            "jtl-htf-bias-panel";

        const dashboard =
            document.querySelector(
                ".jtl-mt5-ea-dashboard"
            ) ||
            document.querySelector(
                ".mt5-ea-dashboard"
            ) ||
            document.body;

        dashboard.appendChild(panel);
    }

    const observations =
        Array.isArray(bias.observations)
            ? bias.observations
            : [];

    panel.innerHTML = `
        <h3>HIGHER-TIMEFRAME BIAS</h3>

        <div class="jtl-htf-bias-grid">

            <div class="jtl-htf-bias-item">
                <span class="jtl-htf-bias-label">
                    HTF Bias
                </span>
                <span class="jtl-htf-bias-value">
                    ${bias.bias ?? "—"}
                </span>
            </div>

            <div class="jtl-htf-bias-item">
                <span class="jtl-htf-bias-label">
                    Strength
                </span>
                <span class="jtl-htf-bias-value">
                    ${bias.strength ?? 0}%
                </span>
            </div>

            <div class="jtl-htf-bias-item">
                <span class="jtl-htf-bias-label">
                    Score
                </span>
                <span class="jtl-htf-bias-value">
                    ${bias.score ?? 0}
                </span>
            </div>

            <div class="jtl-htf-bias-item">
                <span class="jtl-htf-bias-label">
                    Current Price
                </span>
                <span class="jtl-htf-bias-value">
                    ${bias.current_price ?? "—"}
                </span>
            </div>

            <div class="jtl-htf-bias-item">
                <span class="jtl-htf-bias-label">
                    EMA 21
                </span>
                <span class="jtl-htf-bias-value">
                    ${bias.ema21 ?? "—"}
                </span>
            </div>

            <div class="jtl-htf-bias-item">
                <span class="jtl-htf-bias-label">
                    EMA 50
                </span>
                <span class="jtl-htf-bias-value">
                    ${bias.ema50 ?? "—"}
                </span>
            </div>

        </div>

        <div class="jtl-htf-observations">

            <strong>HTF Observations</strong>

            <ul>
                ${
                    observations.length
                    ? observations.map(
                        item => `<li>${item}</li>`
                    ).join("")
                    : "<li>No observations available.</li>"
                }
            </ul>

        </div>
    `;
}


function renderJTLHTFBiasError(message) {

    const panel =
        document.getElementById(
            "jtl-htf-bias-panel"
        );

    if (panel) {

        panel.innerHTML = `
            <h3>HIGHER-TIMEFRAME BIAS</h3>

            <div class="jtl-htf-bias-item">
                HTF analysis unavailable:
                ${message}
            </div>
        `;
    }
}
