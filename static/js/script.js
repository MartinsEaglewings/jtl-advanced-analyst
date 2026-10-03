let priceChart = null;


const cryptoSelect =
    document.getElementById("cryptoSelect");

const intervalInput =
    document.getElementById("interval");

const analyzeButton =
    document.getElementById("analyzeButton");

const connectionText =
    document.getElementById("connectionText");

const connectionDot =
    document.getElementById("connectionDot");

const errorBox =
    document.getElementById("errorBox");


function setConnection(online) {

    connectionText.textContent =
        online
            ? "LIVE MARKET DATA"
            : "DATA CONNECTION ERROR";

    connectionDot.style.background =
        online ? "#29e68a" : "#ff5d73";

    connectionDot.style.boxShadow =
        online
            ? "0 0 12px #29e68a"
            : "0 0 12px #ff5d73";
}


function showError(message) {

    errorBox.textContent = message;

    errorBox.classList.remove("hidden");
}


function clearError() {

    errorBox.textContent = "";

    errorBox.classList.add("hidden");
}


function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    const number = Number(value);

    if (number >= 1000) {
        return number.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
    }

    if (number >= 1) {
        return number.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 4
            }
        );
    }

    return number.toLocaleString(
        undefined,
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }
    );
}


function formatIndicator(value) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toFixed(2);
}




function formatAnalysisNumber(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toLocaleString(undefined, {
        maximumFractionDigits: 8
    });
}



function renderTrendAnalysis(trend) {
    const name = document.getElementById("trendName");
    const badge = document.getElementById("trendDirection");
    const strength = document.getElementById("trendStrength");
    const progress = document.getElementById("trendProgress");
    const direction = document.getElementById("trendDirectionValue");
    const confidence = document.getElementById("trendConfidence");
    const score = document.getElementById("trendScore");
    const sma = document.getElementById("trendSma");
    const ema = document.getElementById("trendEma");
    const momentum = document.getElementById("trendMomentum");
    const observations = document.getElementById("trendObservations");

    if (!trend) {
        if (name) name.textContent = "NO TREND DATA";
        if (badge) badge.textContent = "WAITING";
        if (strength) strength.textContent = "0%";
        if (progress) progress.style.width = "0%";
        if (direction) direction.textContent = "—";
        if (confidence) confidence.textContent = "—";
        if (score) score.textContent = "—";
        if (sma) sma.textContent = "—";
        if (ema) ema.textContent = "—";
        if (momentum) momentum.textContent = "—";
        if (observations) {
            observations.innerHTML = "<li>Trend data was not returned by the server.</li>";
        }
        return;
    }

    const strengthValue = Number(trend.strength);
    const confidenceValue = Number(trend.confidence);
    const scoreValue = Number(trend.score);

    if (name) {
        name.textContent = trend.trend || "UNKNOWN TREND";
    }

    if (badge) {
        badge.textContent = trend.direction || "NEUTRAL";
    }

    if (strength) {
        strength.textContent =
            Number.isFinite(strengthValue) ? strengthValue + "%" : "0%";
    }

    if (progress) {
        progress.style.width =
            Number.isFinite(strengthValue)
                ? Math.max(0, Math.min(100, strengthValue)) + "%"
                : "0%";
    }

    if (direction) {
        direction.textContent = trend.direction || "—";
    }

    if (confidence) {
        confidence.textContent =
            Number.isFinite(confidenceValue)
                ? confidenceValue + "%"
                : "—";
    }

    if (score) {
        score.textContent =
            Number.isFinite(scoreValue)
                ? (scoreValue > 0 ? "+" : "") + scoreValue
                : "—";
    }

    const formatValue = value => {
        const n = Number(value);
        return Number.isFinite(n)
            ? n.toLocaleString(undefined, { maximumFractionDigits: 8 })
            : "—";
    };

    if (sma) sma.textContent = formatValue(trend.sma20);
    if (ema) ema.textContent = formatValue(trend.ema20);
    if (momentum) momentum.textContent = formatValue(trend.momentum10);

    if (observations) {
        observations.innerHTML = "";

        const items = Array.isArray(trend.observations)
            ? trend.observations
            : [];

        if (items.length === 0) {
            observations.innerHTML =
                "<li>No trend observations returned.</li>";
        } else {
            items.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                observations.appendChild(li);
            });
        }
    }
}


async function loadCryptocurrencies() {

    try {

        connectionText.textContent =
            "LOADING CRYPTO CATALOG...";


        const response =
            await fetch("/api/cryptos");


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Unable to load cryptocurrency list."
            );
        }


        cryptoSelect.innerHTML = "";


        const cryptos =
            data.cryptos || [];


        const uniqueSymbols =
            new Set();


        cryptos.forEach(coin => {

            const symbol =
                coin.symbol;


            if (
                !symbol ||
                uniqueSymbols.has(symbol)
            ) {
                return;
            }


            uniqueSymbols.add(symbol);


            const option =
                document.createElement("option");


            option.value =
                symbol;


            option.textContent =
                `${symbol} — ${coin.currency_base || symbol.split("/")[0]}`;


            cryptoSelect.appendChild(option);

        });


        const btcOption =
            [...cryptoSelect.options]
                .find(
                    option =>
                        option.value === "BTC/USD"
                );


        if (btcOption) {
            cryptoSelect.value = "BTC/USD";
        }


        setConnection(true);


    } catch (error) {

        setConnection(false);

        showError(error.message);

        cryptoSelect.innerHTML = `
            <option value="BTC/USD">
                BTC/USD
            </option>
        `;

    }

}


function renderObservations(observations) {

    const container =
        document.getElementById(
            "observations"
        );


    container.innerHTML = "";


    if (
        !observations ||
        observations.length === 0
    ) {

        container.innerHTML =
            `<div class="empty-state">
                No observations available.
             </div>`;

        return;
    }


    observations.forEach(item => {

        const element =
            document.createElement("div");


        element.className =
            "observation";


        element.textContent =
            item;


        container.appendChild(element);

    });

}


function renderChart(candles) {

    const canvas =
        document.getElementById(
            "priceChart"
        );


    const labels =
        candles.map(
            item => item.datetime
        );


    const prices =
        candles.map(
            item => item.close
        );


    if (priceChart) {
        priceChart.destroy();
    }


    priceChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [{

                        label: "Market Price",

                        data: prices,

                        borderWidth: 2,

                        pointRadius: 0,

                        tension: 0.25

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: "index"

                    },

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#718093",

                                maxTicksLimit: 8

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.04)"

                            }

                        },

                        y: {

                            ticks: {

                                color:
                                    "#718093"

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.04)"

                            }

                        }

                    }

                }

            }
        );

}


async function analyzeMarket() {

    const symbol =
        cryptoSelect.value;


    const interval =
        intervalInput.value;


    if (!symbol) {

        showError(
            "Please select a cryptocurrency."
        );

        return;
    }


    clearError();


    analyzeButton.disabled =
        true;


    analyzeButton.textContent =
        "ANALYZING...";


    try {

        const url =
            `/api/analyze?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Market analysis failed."
            );
        }


        const market =
            data.market;


        const indicators =
            data.indicators;


        const analysis =
            data.analysis;


        document.getElementById(
            "marketSymbol"
        ).textContent =
            market.symbol;


        document.getElementById(
            "marketMeta"
        ).textContent =
            `CRYPTO • ${market.interval} • ${market.currency || "USD"}`;


        document.getElementById(
            "currentPrice"
        ).textContent =
            formatPrice(
                data.current_price
            );


        document.getElementById(
            "condition"
        ).textContent =
            analysis.condition;


        document.getElementById(
            "score"
        ).textContent =
            analysis.score;


        document.getElementById(
            "rsi"
        ).textContent =
            formatIndicator(
                indicators.rsi14
            );


        document.getElementById(
            "sma20"
        ).textContent =
            formatPrice(
                indicators.sma20
            );


        document.getElementById(
            "ema20"
        ).textContent =
            formatPrice(
                indicators.ema20
            );


        document.getElementById(
            "momentum"
        ).textContent =
            formatPrice(
                indicators.momentum10
            );


        document.getElementById(
            "candleCount"
        ).textContent =
            `${market.candles.length} candles`;


        renderObservations(
            analysis.observations
        );


        renderTrendAnalysis(
            data.trend
        );


        renderChart(
            market.candles
        );


        setConnection(true);


    } catch (error) {

        setConnection(false);

        showError(
            error.message
        );

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


cryptoSelect.addEventListener(
    "change",
    () => {

        clearError();

    }
);


intervalInput.addEventListener(
    "change",
    () => {

        clearError();

    }
);


loadCryptocurrencies();
