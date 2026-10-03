/*
=========================================================
JTL ADVANCED — TRADE LEVELS FRONTEND
Independent UI module
=========================================================
*/

(function () {
    "use strict";

    let tradeLevelsRefreshTimer = null;

    function loadTradeLevelsCSS() {
        if (document.querySelector('link[data-trade-levels-css]')) {
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "/static/css/trade_levels.css";
        link.dataset.tradeLevelsCss = "true";
        document.head.appendChild(link);
    }

    function createTradeLevelsUI() {

        if (document.getElementById("tlOpenButton")) {
            return;
        }

        const button = document.createElement("button");

        button.id = "tlOpenButton";
        button.className = "tl-open-button";
        button.type = "button";
        button.textContent = "TRADE LEVELS";

        /*
         * Put the button near the main dashboard content
         * without replacing any existing element.
         */
        const anchor =
            document.querySelector(".container") ||
            document.querySelector("main") ||
            document.body;

        anchor.appendChild(button);

        const overlay = document.createElement("div");

        overlay.id = "tlOverlay";
        overlay.className = "tl-overlay";

        overlay.innerHTML = `
            <div class="tl-modal" role="dialog" aria-modal="true"
                 aria-labelledby="tlTitle">

                <div class="tl-header">

                    <div>
                        <h2 id="tlTitle" class="tl-title">
                            TRADE LEVELS
                        </h2>

                        <p class="tl-subtitle">
                            Technical entry, risk and target references
                        </p>
                    </div>

                    <button
                        id="tlCloseButton"
                        class="tl-close"
                        type="button"
                        aria-label="Close Trade Levels">
                        ×
                    </button>

                </div>

                <div class="tl-body">

                    <div id="tlStatus" class="tl-status">
                        Waiting for trade-level analysis...
                    </div>

                    <div class="tl-market-info">

                        <div class="tl-info-card">
                            <span class="tl-label">Market</span>
                            <span id="tlSymbol"
                                  class="tl-value">—</span>
                        </div>

                        <div class="tl-info-card">
                            <span class="tl-label">Timeframe</span>
                            <span id="tlInterval"
                                  class="tl-value">—</span>
                        </div>

                        <div class="tl-info-card">
                            <span class="tl-label">Direction</span>
                            <span id="tlDirection"
                                  class="tl-value tl-direction">—</span>
                        </div>

                        <div class="tl-info-card">
                            <span class="tl-label">Current Price</span>
                            <span id="tlCurrentPrice"
                                  class="tl-value">—</span>
                        </div>

                    </div>

                    <div class="tl-levels">

                        <div class="tl-level tl-entry">
                            <div>
                                <div class="tl-level-name">
                                    ENTRY REFERENCE
                                </div>
                                <div class="tl-level-rr">
                                    Current technical reference
                                </div>
                            </div>

                            <div id="tlEntry"
                                 class="tl-level-price">—</div>
                        </div>

                        <div class="tl-level tl-stop">
                            <div>
                                <div class="tl-level-name">
                                    STOP LOSS
                                </div>
                                <div class="tl-level-rr">
                                    Risk reference
                                </div>
                            </div>

                            <div id="tlStop"
                                 class="tl-level-price">—</div>
                        </div>

                        <div class="tl-level tl-tp">
                            <div>
                                <div class="tl-level-name">
                                    TP1
                                </div>
                                <div id="tlRR1"
                                     class="tl-level-rr">
                                    Risk / Reward — 
                                </div>
                            </div>

                            <div id="tlTP1"
                                 class="tl-level-price">—</div>
                        </div>

                        <div class="tl-level tl-tp">
                            <div>
                                <div class="tl-level-name">
                                    TP2
                                </div>
                                <div id="tlRR2"
                                     class="tl-level-rr">
                                    Risk / Reward —
                                </div>
                            </div>

                            <div id="tlTP2"
                                 class="tl-level-price">—</div>
                        </div>

                        <div class="tl-level tl-tp">
                            <div>
                                <div class="tl-level-name">
                                    TP3
                                </div>
                                <div id="tlRR3"
                                     class="tl-level-rr">
                                    Risk / Reward —
                                </div>
                            </div>

                            <div id="tlTP3"
                                 class="tl-level-price">—</div>
                        </div>

                    </div>

                    <div class="tl-extra">

                        <div class="tl-info-card">
                            <span class="tl-label">ATR 14</span>
                            <span id="tlATR"
                                  class="tl-value">—</span>
                        </div>

                        <div class="tl-info-card">
                            <span class="tl-label">Risk Distance</span>
                            <span id="tlRiskDistance"
                                  class="tl-value">—</span>
                        </div>

                        <div class="tl-info-card">
                            <span class="tl-label">Recent High</span>
                            <span id="tlRecentHigh"
                                  class="tl-value">—</span>
                        </div>

                        <div class="tl-info-card">
                            <span class="tl-label">Recent Low</span>
                            <span id="tlRecentLow"
                                  class="tl-value">—</span>
                        </div>

                    </div>

                </div>

                <div class="tl-footer">
                    Trade levels are technical reference calculations
                    based on current market data and volatility.
                    They are not guaranteed price predictions.
                </div>

            </div>
        `;

        document.body.appendChild(overlay);

        const closeButton =
            document.getElementById("tlCloseButton");

        button.addEventListener("click", function () {
            openTradeLevels();
        });

        closeButton.addEventListener("click", function () {
            closeTradeLevels();
        });

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                closeTradeLevels();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeTradeLevels();
            }
        });
    }

    function openTradeLevels() {

        const overlay =
            document.getElementById("tlOverlay");

        if (!overlay) {
            return;
        }

        overlay.classList.add("tl-visible");

        loadTradeLevels();

        if (tradeLevelsRefreshTimer) {
            clearInterval(tradeLevelsRefreshTimer);
        }

        tradeLevelsRefreshTimer = setInterval(
            loadTradeLevels,
            15000
        );
    }

    function closeTradeLevels() {

        const overlay =
            document.getElementById("tlOverlay");

        if (!overlay) {
            return;
        }

        overlay.classList.remove("tl-visible");

        if (tradeLevelsRefreshTimer) {
            clearInterval(tradeLevelsRefreshTimer);
            tradeLevelsRefreshTimer = null;
        }
    }

    function currentMarketValues() {

        /*
         * These selectors allow the module to read the
         * existing dashboard selections without changing
         * the existing analyst JavaScript.
         */

        const symbolElement =
            document.querySelector(
                "#symbol, #cryptoSelect, select[name='symbol']"
            );

        const intervalElement =
            document.querySelector(
                "#interval, #timeframe, select[name='interval']"
            );

        return {
            symbol: symbolElement
                ? symbolElement.value
                : "BTC/USD",

            interval: intervalElement
                ? intervalElement.value
                : "1min"
        };
    }

    async function loadTradeLevels() {

        const status =
            document.getElementById("tlStatus");

        const market =
            currentMarketValues();

        status.textContent =
            "Calculating technical trade levels...";

        try {

            const url =
                "/api/trade-levels" +
                "?symbol=" +
                encodeURIComponent(market.symbol) +
                "&interval=" +
                encodeURIComponent(market.interval);

            const response =
                await fetch(url, {
                    method: "GET",
                    cache: "no-store"
                });

            if (!response.ok) {
                throw new Error(
                    "Trade levels endpoint returned " +
                    response.status
                );
            }

            const data = await response.json();

            if (data.status !== "READY") {
                status.textContent =
                    data.message ||
                    "Trade levels are not currently available.";

                return;
            }

            renderTradeLevels(data, market);

        } catch (error) {

            console.error(
                "Trade Levels Error:",
                error
            );

            status.textContent =
                "Trade Levels is waiting for the backend API connection.";
        }
    }

    function number(value, digits = 2) {

        if (
            value === null ||
            value === undefined ||
            value === "" ||
            Number.isNaN(Number(value))
        ) {
            return "—";
        }

        return Number(value).toLocaleString(
            undefined,
            {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            }
        );
    }

    function renderTradeLevels(data, market) {

        document.getElementById("tlStatus").textContent =
            data.message ||
            "Technical trade levels calculated successfully.";

        document.getElementById("tlSymbol").textContent =
            market.symbol;

        document.getElementById("tlInterval").textContent =
            market.interval;

        document.getElementById("tlDirection").textContent =
            data.direction || "—";

        document.getElementById("tlCurrentPrice").textContent =
            number(data.current_price);

        document.getElementById("tlEntry").textContent =
            number(data.entry_reference);

        document.getElementById("tlStop").textContent =
            number(data.stop_loss);

        document.getElementById("tlTP1").textContent =
            number(data.tp1);

        document.getElementById("tlTP2").textContent =
            number(data.tp2);

        document.getElementById("tlTP3").textContent =
            number(data.tp3);

        document.getElementById("tlRR1").textContent =
            "Risk / Reward " +
            number(data.risk_reward_tp1, 1) +
            "R";

        document.getElementById("tlRR2").textContent =
            "Risk / Reward " +
            number(data.risk_reward_tp2, 1) +
            "R";

        document.getElementById("tlRR3").textContent =
            "Risk / Reward " +
            number(data.risk_reward_tp3, 1) +
            "R";

        document.getElementById("tlATR").textContent =
            number(data.atr14);

        document.getElementById("tlRiskDistance").textContent =
            number(data.risk_distance);

        document.getElementById("tlRecentHigh").textContent =
            number(data.recent_high);

        document.getElementById("tlRecentLow").textContent =
            number(data.recent_low);
    }

    function initialize() {

        loadTradeLevelsCSS();

        createTradeLevelsUI();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }

})();
