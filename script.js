/* =========================================================
   NER-SMART
   STEP 3B — LIVE CORRIDOR MAP + DASHBOARD LOGIC
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let nerMap = null;

let vehicleMarker = null;

let primaryRoute = null;
let alternateRoute = null;

let guwahatiMarker = null;
let tawangMarker = null;

let mapInitialized = false;


/* =========================================================
   NER CORRIDOR COORDINATES
========================================================= */

const locations = {

    guwahati: [26.1445, 91.7362],

    bhalukpong: [27.0167, 92.6500],

    bomdila: [27.2645, 92.4247],

    dirang: [27.3588, 92.2410],

    tawang: [27.5860, 91.8590]

};


/* =========================================================
   PRIMARY OPERATIONAL CORRIDOR
========================================================= */

const primaryRoutePoints = [

    locations.guwahati,

    [26.32, 91.91],

    [26.55, 92.18],

    [26.78, 92.48],

    locations.bhalukpong,

    [27.10, 92.57],

    locations.bomdila,

    locations.dirang,

    [27.46, 92.08],

    locations.tawang

];


/* =========================================================
   ALTERNATE CORRIDOR
   Prototype operational alternative
========================================================= */

const alternateRoutePoints = [

    locations.guwahati,

    [26.25, 91.82],

    [26.55, 92.05],

    [26.82, 92.30],

    [27.02, 92.48],

    [27.18, 92.50],

    [27.35, 92.38],

    [27.45, 92.15],

    locations.tawang

];


/* =========================================================
   MAP INITIALIZATION
========================================================= */

function initializeNERMap() {

    if (typeof L === "undefined") {

        console.error(
            "Leaflet library could not be loaded."
        );

        return;

    }


    const mapElement =
        document.getElementById("nerMap");


    if (!mapElement) {

        console.error(
            "NER map container not found."
        );

        return;

    }


    if (mapInitialized) {

        return;

    }


    /* ---------------------------------------------
       CREATE MAP
    --------------------------------------------- */

    nerMap = L.map(
        "nerMap",
        {
            zoomControl: true,

            scrollWheelZoom: true,

            attributionControl: true
        }
    );


    /* ---------------------------------------------
       SATELLITE BASE MAP
    --------------------------------------------- */

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 18,

            attribution: "Tiles © Esri"
        }
    ).addTo(nerMap);


    /* ---------------------------------------------
       PLACE NAMES + BOUNDARIES
    --------------------------------------------- */

    L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 18,

            opacity: 1,

            attribution: "Labels & boundaries © Esri"
        }
    ).addTo(nerMap);


    /* ---------------------------------------------
       INITIAL VIEW
    --------------------------------------------- */

    nerMap.fitBounds(
        [
            locations.guwahati,
            locations.tawang
        ],
        {
            padding: [35, 35]
        }
    );


    /* ---------------------------------------------
       ADD ROUTES
    --------------------------------------------- */

    primaryRoute =
        L.polyline(
            primaryRoutePoints,
            {
                color: "#13d6a5",

                weight: 7,

                opacity: 0.92,

                lineCap: "round",

                lineJoin: "round"
            }
        ).addTo(nerMap);


    /* ---------------------------------------------
       ROUTE GLOW
    --------------------------------------------- */

    L.polyline(
        primaryRoutePoints,
        {
            color: "#16a997",

            weight: 14,

            opacity: 0.18,

            lineCap: "round",

            lineJoin: "round"
        }
    ).addTo(nerMap);


    /* ---------------------------------------------
       ALTERNATE ROUTE
    --------------------------------------------- */

    alternateRoute =
        L.polyline(
            alternateRoutePoints,
            {
                color: "#ffd43b",

                weight: 5,

                opacity: 0.95,

                dashArray: "12 9",

                lineCap: "round",

                lineJoin: "round"
            }
        ).addTo(nerMap);


    /* ---------------------------------------------
       CITY MARKERS
    --------------------------------------------- */

    guwahatiMarker =
        createLocationMarker(
            locations.guwahati,
            "Guwahati",
            "DEPOT"
        );


    tawangMarker =
        createLocationMarker(
            locations.tawang,
            "Tawang",
            "DESTINATION"
        );


    /* ---------------------------------------------
       INTERMEDIATE LOCATION LABELS
    --------------------------------------------- */

    createSmallLabel(
        locations.bhalukpong,
        "Bhalukpong",
        "normal"
    );


    createSmallLabel(
        locations.bomdila,
        "Bomdila",
        "normal"
    );


    createSmallLabel(
        locations.dirang,
        "Dirang",
        "normal"
    );


    /* ---------------------------------------------
       STRONG MAJOR PLACE LABELS
    --------------------------------------------- */

    createSmallLabel(
        locations.guwahati,
        "GUWAHATI",
        "major"
    );


    createSmallLabel(
        locations.tawang,
        "TAWANG",
        "major"
    );


    /* ---------------------------------------------
       VEHICLE
    --------------------------------------------- */

    vehicleMarker =
        createVehicleMarker(
            [26.72, 92.43]
        );


    /* ---------------------------------------------
       MAP INITIALIZED
    --------------------------------------------- */

    mapInitialized = true;


    console.log(
        "NER-SMART live corridor map initialized."
    );

}


/* =========================================================
   LOCATION MARKER
========================================================= */

function createLocationMarker(
    coordinates,
    name,
    type
) {

    const icon =
        L.divIcon({

            className: "ner-location-marker",

            html: `
                <div class="ner-pin">

                    <div class="ner-pin-dot"></div>

                </div>

                <div class="ner-location-label">

                    <strong>${name}</strong>

                    <small>${type}</small>

                </div>
            `,

            iconSize: [130, 45],

            iconAnchor: [8, 8]
        });


    return L.marker(
        coordinates,
        {
            icon: icon,

            interactive: true
        }
    )
    .addTo(nerMap)
    .bindPopup(
        `
            <div class="ner-popup">

                <strong>${name}</strong>

                <span>${type}</span>

                <small>
                    NER-SMART corridor node
                </small>

            </div>
        `
    );

}


/* =========================================================
   SMALL LOCATION LABEL
========================================================= */

function createSmallLabel(
    coordinates,
    name,
    type = "normal"
) {

    const isMajor =
        type === "major";


    const labelBackground =
        isMajor
            ? "rgba(5, 15, 25, 0.94)"
            : "rgba(7, 18, 29, 0.90)";


    const labelBorder =
        isMajor
            ? "1px solid rgba(56, 217, 255, 0.65)"
            : "1px solid rgba(255, 255, 255, 0.32)";


    const labelFontSize =
        isMajor
            ? "12px"
            : "11px";


    const labelPadding =
        isMajor
            ? "6px 10px"
            : "5px 9px";


    const dotSize =
        isMajor
            ? "8px"
            : "7px";


    const icon =
        L.divIcon({

            className: "ner-small-label",

            html: `
                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:7px;

                        padding:${labelPadding};

                        background:${labelBackground};

                        border:${labelBorder};

                        border-radius:7px;

                        color:#ffffff;

                        font-family:Inter,Arial,sans-serif;

                        font-size:${labelFontSize};

                        font-weight:800;

                        letter-spacing:0.7px;

                        white-space:nowrap;

                        line-height:1;

                        box-shadow:
                            0 4px 14px rgba(0,0,0,0.55),
                            0 0 12px rgba(56,217,255,0.12);

                        backdrop-filter:blur(6px);

                        -webkit-backdrop-filter:blur(6px);

                        text-shadow:
                            0 1px 3px rgba(0,0,0,0.9);

                        pointer-events:none;
                    "
                >

                    <span
                        style="
                            display:block;

                            width:${dotSize};

                            height:${dotSize};

                            min-width:${dotSize};

                            border-radius:50%;

                            background:#38d9ff;

                            box-shadow:
                                0 0 8px rgba(56,217,255,0.95);
                        "
                    ></span>

                    <span>${name}</span>

                </div>
            `,

            iconSize: null,

            iconAnchor: [0, 0]
        });


    L.marker(
        coordinates,
        {
            icon: icon,

            interactive: false,

            zIndexOffset: 500
        }
    ).addTo(nerMap);

}


/* =========================================================
   VEHICLE MARKER
========================================================= */

function createVehicleMarker(
    coordinates
) {

    const icon =
        L.divIcon({

            className: "ner-vehicle-icon",

            html: `

                <div class="vehicle-radar"></div>

                <div class="vehicle-core">

                    <span>
                        🚚
                    </span>

                </div>

                <div class="vehicle-label">

                    <strong>
                        NER-042
                    </strong>

                    <small>
                        MEDICINE
                    </small>

                </div>

            `,

            iconSize: [130, 65],

            iconAnchor: [20, 20]
        });


    return L.marker(
        coordinates,
        {
            icon: icon,

            zIndexOffset: 1000
        }
    )
    .addTo(nerMap)
    .bindPopup(
        `
            <div class="ner-popup">

                <strong>
                    NER-042
                </strong>

                <span>
                    Critical Medicine Carrier
                </span>

                <small>
                    Speed: 42 km/h
                </small>

                <small>
                    Status: Moving
                </small>

            </div>
        `
    );

}


/* =========================================================
   RESET MAP
========================================================= */

function resetMapView() {

    if (!nerMap) {

        return;

    }


    nerMap.fitBounds(
        [
            locations.guwahati,
            locations.tawang
        ],
        {
            padding: [35, 35],

            animate: true,

            duration: 0.8
        }
    );

}


/* =========================================================
   VEHICLE DEMO MOVEMENT
========================================================= */

function moveVehicleDemo() {

    if (!vehicleMarker) {

        return;

    }


    const demoPath = [

        [26.72, 92.43],

        [26.80, 92.50],

        [26.90, 92.55],

        [27.02, 92.58],

        [27.14, 92.51],

        [27.26, 92.42]

    ];


    let index = 0;


    const moveNext = () => {

        if (index >= demoPath.length) {

            return;

        }


        vehicleMarker
            .setLatLng(
                demoPath[index]
            );


        index++;


        setTimeout(
            moveNext,
            1200
        );

    };


    moveNext();

}


/* =========================================================
   DASHBOARD DEMO STATE
========================================================= */

const demoState = {

    running: false,

    accessibility: 78,

    weatherRisk: 18,

    eta: "14h 30m",

    corridor: "Operational"

};


/* =========================================================
   UPDATE SCORE
========================================================= */

function updateAccessibilityScore(
    value
) {

    const score =
        document.getElementById(
            "accessibilityScore"
        );


    const ring =
        document.getElementById(
            "scoreRingValue"
        );


    const large =
        document.getElementById(
            "largeScore"
        );


    if (score) {

        score.textContent = value;

    }


    if (ring) {

        ring.textContent = value;

    }


    if (large) {

        large.textContent = value;

    }

}


/* =========================================================
   UPDATE WEATHER
========================================================= */

function updateWeatherRisk(
    value
) {

    const risk =
        document.getElementById(
            "weatherRisk"
        );


    const meter =
        document.getElementById(
            "weatherMeter"
        );


    const factor =
        document.getElementById(
            "weatherFactor"
        );


    const factorBar =
        document.getElementById(
            "weatherFactorBar"
        );


    if (risk) {

        risk.textContent = value;

    }


    if (meter) {

        meter.style.width =
            value + "%";

    }


    if (factor) {

        factor.textContent =
            value + "%";

    }


    if (factorBar) {

        factorBar.style.width =
            value + "%";

    }

}
// ===============================
// AI RISK ENGINE
// ===============================

const riskWeights = {
  weather: 20,
  road: 25,
  terrain: 20,
  incident: 25,
  historical: 10
};

const riskState = {
  weather: 18,
  road: 22,
  terrain: 16,
  incident: 10,
  historical: 8
};


// Calculate weighted corridor risk
function calculateTotalRisk() {
  const weightedRisk =
    (riskState.weather * riskWeights.weather / 100) +
    (riskState.road * riskWeights.road / 100) +
    (riskState.terrain * riskWeights.terrain / 100) +
    (riskState.incident * riskWeights.incident / 100) +
    (riskState.historical * riskWeights.historical / 100);

  return weightedRisk;
}


// Convert risk into accessibility score
function calculateAIAccessibility() {
  const totalRisk = calculateTotalRisk();

  return Math.max(
    0,
    Math.min(100, Math.round(100 - totalRisk))
  );
}


// Get accessibility status
function getAccessibilityStatus(score) {

  if (score <= 30) {
    return {
      label: "CRITICAL",
      summary: "Corridor inaccessible",
      description: "Severe disruption detected. Route should not be used.",
      decision: "Suspend corridor movement",
      icon: "!"
    };
  }

  if (score <= 50) {
    return {
      label: "HIGH RISK",
      summary: "Major accessibility risk detected",
      description: "Multiple disruption signals indicate unsafe or unreliable movement.",
      decision: "Reroute through alternate corridor",
      icon: "!"
    };
  }

  if (score <= 70) {
    return {
      label: "MODERATE",
      summary: "Corridor accessibility is declining",
      description: "NER-SMART recommends caution and continuous monitoring.",
      decision: "Proceed with caution",
      icon: "!"
    };
  }

  if (score <= 85) {
    return {
      label: "ACCESSIBLE",
      summary: "Corridor currently accessible",
      description: "Current disruption signals remain within operational limits.",
      decision: "Continue on primary corridor",
      icon: "✓"
    };
  }

  return {
    label: "HIGHLY ACCESSIBLE",
    summary: "Corridor operating normally",
    description: "Low disruption probability detected across monitored signals.",
    decision: "Continue normal operations",
    icon: "✓"
  };
}


// Update individual risk factor
function updateRiskFactorUI(name, value) {

  const valueElement = document.getElementById(`${name}Factor`);
  const barElement = document.getElementById(`${name}FactorBar`);

  if (valueElement) {
    valueElement.textContent = `${value}%`;
  }

  if (barElement) {
    barElement.style.width = `${Math.min(100, Math.max(0, value))}%`;
  }
}


// Main AI Risk Engine update
function updateRiskEngine() {

  const score = calculateAIAccessibility();
  const status = getAccessibilityStatus(score);

  // Update all risk factor cards
  updateRiskFactorUI("weather", riskState.weather);
  updateRiskFactorUI("road", riskState.road);
  updateRiskFactorUI("terrain", riskState.terrain);
  updateRiskFactorUI("field", riskState.incident);
  updateRiskFactorUI("history", riskState.historical);


  // Main score
  const largeScore = document.getElementById("largeScore");
  const largeScoreLabel = document.getElementById("largeScoreLabel");

  if (largeScore) {
    largeScore.textContent = score;
  }

  if (largeScoreLabel) {
    largeScoreLabel.textContent = status.label;
  }


  // AI summary
  const aiSummary = document.getElementById("aiSummary");
  const aiDescription = document.getElementById("aiDescription");

  if (aiSummary) {
    aiSummary.textContent = status.summary;
  }

  if (aiDescription) {
    aiDescription.textContent = status.description;
  }


  // AI decision
  const aiDecision = document.getElementById("aiDecision");
  const decisionIcon = document.getElementById("decisionIcon");

  if (aiDecision) {
    aiDecision.textContent = status.decision;
  }

  if (decisionIcon) {
    decisionIcon.textContent = status.icon;
  }


  // Sync dashboard accessibility score
  const accessibilityScore = document.getElementById("accessibilityScore");

  if (accessibilityScore) {
    accessibilityScore.textContent = score;
  }


  // Keep global demo state synchronized
  if (typeof demoState !== "undefined") {
    demoState.accessibility = score;
  }
}


// Process AI events during simulation
function processAIEvent(type) {

  switch (type) {

    case "weather":

      riskState.weather = 42;

      break;


    case "terrain":

      riskState.terrain = 55;

      break;


    case "incident":

      riskState.incident = 75;

      break;


    case "blocked":

      riskState.road = 100;
      riskState.incident = 100;

      break;
  }

  updateRiskEngine();
}


// Initialize AI engine
updateRiskEngine();


/* =========================================================
   START DEMO
========================================================= */

function startLiveSimulation() {

    if (demoState.running) {

        return;

    }


    demoState.running = true;


    const button =
        document.getElementById(
            "startDemoBtn"
        );


    const simulationStatus =
        document.getElementById(
            "simulationStatus"
        );


    if (button) {

        button.disabled = true;

        button.innerHTML =
            "<span>●</span> Simulation Running";

    }


    if (simulationStatus) {

        simulationStatus.textContent =
            "Monitoring corridor conditions...";

    }


    /* ---------------------------------------------
       MOVE VEHICLE
    --------------------------------------------- */

    moveVehicleDemo();


    /* ---------------------------------------------
       STAGE 1 — WEATHER
    --------------------------------------------- */

    setTimeout(
        () => {

           updateWeatherRisk(42);
processAIEvent("weather");
updateWeatherIntelligence();
const weatherAlert = document.getElementById("alertOne");

if (weatherAlert) {

    weatherAlert.querySelector("strong").textContent =
        "Severe weather detected";

    weatherAlert.querySelector("small").textContent =
        "Tawang sector • Heavy rain & low visibility";
}
            


            const status =
                document.getElementById(
                    "accessibilityStatus"
                );


            if (status) {

                status.textContent =
                    "● Moderate Risk";

            }


            if (simulationStatus) {

                simulationStatus.textContent =
                    "Weather deterioration detected";

            }

        },
        2500
    );


    /* ---------------------------------------------
       STAGE 2 — FIELD INCIDENT
    --------------------------------------------- */

    setTimeout(
        () => {

            createIncidentMarker();
processAIEvent("incident");
const reportOne = document.getElementById("reportOne");

if (reportOne) {
    reportOne.querySelector(".report-indicator").className =
        "report-indicator danger";

    reportOne.querySelector(".report-content strong").textContent =
        "Landslide reported";

    reportOne.querySelector(".report-content span").textContent =
        "Tawang sector • Just now";

    reportOne.querySelector(".verified").textContent =
        "AI VERIFIED";
}
const alertTwo = document.getElementById("alertTwo");

if (alertTwo) {
    alertTwo.querySelector("strong").textContent =
        "Landslide incident detected";

    alertTwo.querySelector("small").textContent =
        "Tawang sector • AI verified";
}


            if (simulationStatus) {

                simulationStatus.textContent =
                    "Field officer reported landslide";

            }

        },
        5200
    );
    // ---------------------------------------------
// STAGE 2.5 — TERRAIN RISK
// ---------------------------------------------

setTimeout(
    () => {

        processAIEvent("terrain");

        if (simulationStatus) {
            simulationStatus.textContent =
                "Terrain risk detected • Landslide-prone corridor";
        }

    },
    6500
);


    /* ---------------------------------------------
       STAGE 3 — AI VERIFICATION
    --------------------------------------------- */

    setTimeout(
        () => {



            if (simulationStatus) {

                simulationStatus.textContent =
                    "AI verified incident • 94% confidence";

            }

        },
        7600
    );


    /* ---------------------------------------------
       STAGE 4 — ROUTE DECISION
    --------------------------------------------- */

    setTimeout(
        () => {

            activateRouteBlockage();
            processAIEvent("blocked");
           const alertOne = document.getElementById("alertOne");

if (alertOne) {
    alertOne.querySelector("strong").textContent =
        "Route A blocked • Rerouting";

    alertOne.querySelector("small").textContent =
        "Alternate corridor recommended";
}


            if (simulationStatus) {

                simulationStatus.textContent =
                    "Route A blocked • Alternate route recommended";

            }

        },
        9800
    );


    /* ---------------------------------------------
       STAGE 5 — ETA UPDATE
    --------------------------------------------- */

    setTimeout(
        () => {

            updateETA();
            const authorityAlert = document.getElementById("alertCount");

if (authorityAlert) {
    authorityAlert.textContent = "3";
}
const alertContainer = document.getElementById("alertTwo")?.parentElement;

if (alertContainer && !document.getElementById("alertThree")) {
    alertContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div class="alert-item" id="alertThree">
            <div class="alert-icon success">✓</div>
            <div>
                <strong>Authority alert prepared</strong>
                <small>Route B selected • Mission continues</small>
            </div>
        </div>
        `
    );
}

if (simulationStatus) {
    simulationStatus.textContent =
        "Route B selected • Authority alert prepared";
}
            const finalDecision = document.getElementById("aiDecision");

if (finalDecision) {
    finalDecision.textContent =
        "Route B selected • Mission continues";
}

const finalSummary = document.getElementById("aiSummary");

if (finalSummary) {
    finalSummary.textContent =
        "Alternate corridor successfully selected";
}



            if (simulationStatus) {

                simulationStatus.textContent =
                    "Route B selected • Authority alert prepared";

            }

        },
        12000
    );

}


/* =========================================================
   INCIDENT MARKER
========================================================= */

function createIncidentMarker() {

    if (!nerMap) {

        return;

    }


    const incidentLocation =
        [27.30, 92.39];


    const icon =
        L.divIcon({

            className:
                "ner-incident-marker",

            html: `

                <div class="incident-pulse"></div>

                <div class="incident-core">
                    !
                </div>

                <div class="incident-label">

                    <strong>
                        INCIDENT
                    </strong>

                    <small>
                        Landslide reported
                    </small>

                </div>
            `,

            iconSize: [150, 65],

            iconAnchor: [14, 14]
        });


    L.marker(
        incidentLocation,
        {
            icon: icon,

            zIndexOffset: 1500
        }
    )
    .addTo(nerMap)
    .bindPopup(
        `
            <div class="ner-popup incident-popup">

                <strong>
                    LANDSLIDE INCIDENT
                </strong>

                <span>
                    Tawang Corridor
                </span>

                <small>
                    Field report received
                </small>

                <small>
                    AI verification confidence: 94%
                </small>

            </div>
        `
    )
    .openPopup();

}


/* =========================================================
   ROUTE BLOCKAGE
========================================================= */

function activateRouteBlockage() {

    if (!primaryRoute) {

        return;

    }


    /* ---------------------------------------------
       MAKE PRIMARY ROUTE RED
    --------------------------------------------- */

    primaryRoute.setStyle({

        color: "#ff3b43",

        weight: 7,

        opacity: 0.95,

        dashArray: "14 8"

    });


    /* ---------------------------------------------
       ALTERNATE BECOMES STRONGER
    --------------------------------------------- */

    if (alternateRoute) {

        alternateRoute.setStyle({

            color: "#19e0a6",

            weight: 7,

            opacity: 1,

            dashArray: null

        });

    }


    /* ---------------------------------------------
       UPDATE CORRIDOR STATUS
    --------------------------------------------- */

    const corridorStatus =
        document.getElementById(
            "corridorStatus"
        );


    const mapCondition =
        document.getElementById(
            "mapCondition"
        );


    if (corridorStatus) {

        corridorStatus.textContent =
            "● Route A Blocked";

        corridorStatus.style.color =
            "#e64c54";

    }


    if (mapCondition) {

        mapCondition.innerHTML = `
            <span class="condition-dot danger"></span>
            <span>Route A Blocked • Rerouting</span>
        `;

    }


    /* ---------------------------------------------
       UPDATE AI DECISION
    --------------------------------------------- */

    const decision =
        document.getElementById(
            "aiDecision"
        );


    if (decision) {

        decision.textContent =
            "Switch to alternate corridor";

    }
    const decisionIcon =
    document.getElementById("decisionIcon");

if (decisionIcon) {

    decisionIcon.textContent = "↗";

}


    /* ---------------------------------------------
       UPDATE AI SUMMARY
    --------------------------------------------- */

    const summary =
        document.getElementById(
            "aiSummary"
        );


    if (summary) {

        summary.textContent =
            "Disruption detected on primary route";

    }

}


/* =========================================================
   UPDATE ETA
========================================================= */

function updateETA() {

    const eta =
        document.getElementById(
            "currentEta"
        );


    const etaStatus =
        document.getElementById(
            "etaStatus"
        );


    if (eta) {

        eta.innerHTML =
            "17<small>h 15m</small>";

    }


    if (etaStatus) {

        etaStatus.textContent =
            "Updated after rerouting";

    }


    demoState.eta =
        "17h 15m";

}


/* =========================================================
   BUTTON EVENTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ---------------------------------------------
           INITIALIZE MAP
        --------------------------------------------- */

        initializeNERMap();


        /* ---------------------------------------------
           RESET MAP
        --------------------------------------------- */

        const resetButton =
            document.getElementById(
                "mapResetBtn"
            );


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetMapView
            );

        }


        /* =====================================================
           MAP FULLSCREEN
        ===================================================== */

        const fullscreenButton =
            document.getElementById(
                "mapFullscreenBtn"
            );


        const mapCard =
            document.querySelector(
                ".map-card"
            );


        if (
            fullscreenButton &&
            mapCard
        ) {

            fullscreenButton.addEventListener(
                "click",
                () => {

                    const isFullscreen =
                        mapCard.classList.contains(
                            "map-fullscreen"
                        );


                    if (!isFullscreen) {

                        mapCard.classList.add(
                            "map-fullscreen"
                        );


                        fullscreenButton.innerHTML =
                            "✕ Exit Full Screen";


                        /* Leaflet needs to recalculate size */

                        setTimeout(
                            () => {

                                if (nerMap) {

                                    nerMap.invalidateSize();

                                }

                            },
                            300
                        );

                    } else {

                        mapCard.classList.remove(
                            "map-fullscreen"
                        );


                        fullscreenButton.innerHTML =
                            "⛶ Full Screen";


                        setTimeout(
                            () => {

                                if (nerMap) {

                                    nerMap.invalidateSize();

                                }

                            },
                            300
                        );

                    }

                }
            );

        }


        /* ---------------------------------------------
           START SIMULATION
        --------------------------------------------- */

        const startButton =
            document.getElementById(
                "startDemoBtn"
            );
            const resetDemoButton =
    document.getElementById(
        "resetDemoBtn"
    );

if (resetDemoButton) {

    resetDemoButton.addEventListener(
        "click",
        resetLiveSimulation
    );

}


        if (startButton) {

            startButton.addEventListener(
                "click",
                startLiveSimulation
            );

        }


    }
);
function resetLiveSimulation() {

    demoState.running = false;

    // Reset main dashboard values
    updateWeatherRisk(18);
    updateAccessibilityScore(78);

    // Reset weather intelligence
    const temperature = document.getElementById("temperature");
    const condition = document.getElementById("weatherCondition");
    const rain = document.getElementById("rainProbability");
    const visibility = document.getElementById("visibility");
    const wind = document.getElementById("wind");

    if (temperature) temperature.textContent = "12°C";
    if (condition) condition.textContent = "Cloudy";
    if (rain) rain.textContent = "32%";
    if (visibility) visibility.textContent = "7.2 km";
    if (wind) wind.textContent = "18 km/h";

    // Reset ETA
    const eta = document.getElementById("currentEta");
    const etaStatus = document.getElementById("etaStatus");

    if (eta) {
        eta.innerHTML = "14<small>h 30m</small>";
    }

    if (etaStatus) {
        etaStatus.textContent = "On schedule";
    }

    // Reset simulation text
    const simulationStatus =
        document.getElementById("simulationStatus");

    if (simulationStatus) {
        simulationStatus.textContent =
            "Ready to simulate corridor disruption";
    }

    // Enable start button again
    const button =
        document.getElementById("startDemoBtn");

    if (button) {
        button.disabled = false;
        button.innerHTML =
            "<span>▶</span> Start Live Simulation";
    }

    // Reset route styles
    if (primaryRoute) {
        primaryRoute.setStyle({
            color: "#ff5a5f",
            weight: 5,
            opacity: 0.8,
            dashArray: "10 8"
        });
    }

    if (alternateRoute) {
        alternateRoute.setStyle({
            color: "#19e0a6",
            weight: 4,
            opacity: 0.65,
            dashArray: "8 6"
        });
    }

    // Reset corridor status
    const corridorStatus =
        document.getElementById("corridorStatus");

    if (corridorStatus) {
        corridorStatus.textContent =
            "● Operational";

        corridorStatus.style.color = "";
    }

    const mapCondition =
        document.getElementById("mapCondition");

    if (mapCondition) {
        mapCondition.innerHTML = `
            <span class="condition-dot"></span>
            <span>Corridor Operational</span>
        `;
    }

    // Reset AI decision
    const decision =
        document.getElementById("aiDecision");

    if (decision) {
        decision.textContent =
            "Continue on primary corridor";
    }

    const summary =
        document.getElementById("aiSummary");

    if (summary) {
        summary.textContent =
            "Corridor currently accessible";
    }

    // Reset alerts
    const alertOne =
        document.getElementById("alertOne");

    if (alertOne) {
        alertOne.querySelector("strong").textContent =
            "Weather monitoring active";

        alertOne.querySelector("small").textContent =
            "Tawang sector";
    }

    const alertTwo =
        document.getElementById("alertTwo");

    if (alertTwo) {
        alertTwo.querySelector("strong").textContent =
            "Terrain risk watch enabled";

        alertTwo.querySelector("small").textContent =
            "Mountain corridor";
    }

    // Reset AI risk values
    riskState.weather = 18;
    riskState.road = 22;
    riskState.terrain = 16;
    riskState.incident = 10;
    riskState.historical = 8;

        updateRiskEngine();

    // Reset authority alert
    const alertThree = document.getElementById("alertThree");

    if (alertThree) {
        alertThree.remove();
    }

    const alertCount = document.getElementById("alertCount");

    if (alertCount) {
        alertCount.textContent = "2";
    }

}
// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        navItems.forEach((nav) => {
            nav.classList.remove("active");
        });

        item.classList.add("active");

        const label = item
            .querySelector("span:nth-child(2)")
            ?.textContent
            .trim();

        const sections = {
            "Command Center": ".top-header",
            "Corridor Map": ".map-card",
            "AI Risk Engine": ".risk-card",
            "Field Intelligence": ".lower-grid",
            "Alerts": "#alertOne",
            "Fleet": ".mission-banner",
            "History": ".footer"
        };

        const target = sections[label];

        if (target) {

            const element = document.querySelector(target);

            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }

    });

});
// =====================================================
// LIVE IST CLOCK
// =====================================================

function updateLiveClock() {

    const timeElement =
        document.querySelector(".header-time");

    if (!timeElement) {
        return;
    }

    const now = new Date();

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata"
    });

    timeElement.textContent = `${time} IST`;
}


// Start live clock
updateLiveClock();

setInterval(updateLiveClock, 1000);
 // =====================================================
// LIVE GPS + VEHICLE STATUS
// =====================================================

function updateLiveVehicle() {

    const vehicleStatus =
        document.getElementById("vehicleStatus");

    const gpsUpdate =
        document.getElementById("gpsUpdate");

    if (!vehicleStatus || !gpsUpdate) {
        return;
    }

    const speed =
        Math.floor(38 + Math.random() * 10);

    vehicleStatus.textContent =
        `Moving • ${speed} km/h`;

    const now = new Date();

    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata"
    });

    gpsUpdate.textContent = time;
}


// Initial update
updateLiveVehicle();


// Update every 3 seconds
setInterval(updateLiveVehicle, 3000);
 // =====================================================
// WEATHER INTELLIGENCE SIMULATION
// =====================================================

function updateWeatherIntelligence() {

    const temperature =
        document.getElementById("temperature");

    const condition =
        document.getElementById("weatherCondition");

    const rain =
        document.getElementById("rainProbability");

    const visibility =
        document.getElementById("visibility");

    const wind =
        document.getElementById("wind");

    if (temperature) {
        temperature.textContent = "8°C";
    }

    if (condition) {
        condition.textContent = "Heavy Rain";
    }

    if (rain) {
        rain.textContent = "68%";
    }

    if (visibility) {
        visibility.textContent = "3.8 km";
    }

    if (wind) {
        wind.textContent = "27 km/h";
    }
}
/* =========================================================
/* =========================================================
   NOVARQ OG TEAM — CINEMATIC LOGO ANIMATION
========================================================= */

(function () {

    const teamMembers = [
        "SHUBHAM RAJ SHARMA",
        "PAARIJAAT",
        "RO LI BI ANN",
        "SURAJ KUMAR SINGH",
        "AKASH YADAV",
        "RISHU RAJ"
    ];

    let animationRunning = false;


    /* =====================================================
       CREATE OVERLAY
    ===================================================== */

    function createNovarqTeamOverlay() {

        const overlay =
            document.createElement("div");

        overlay.className =
            "novarq-team-overlay";


        /* -------------------------------------------------
           SINGLE BLACK SCREEN
        ------------------------------------------------- */

        const blackout =
            document.createElement("div");

        blackout.className =
            "novarq-blackout";


        /* -------------------------------------------------
           CONTENT
        ------------------------------------------------- */

        const content =
            document.createElement("div");

        content.className =
            "novarq-team-content";


        const kicker =
            document.createElement("div");

        kicker.className =
            "novarq-team-kicker";

        kicker.textContent =
            "NOVARQ • ORIGINAL CORE";


        const title =
            document.createElement("h1");

        title.className =
            "novarq-team-title";

        title.textContent =
            "OG TEAM MEMBERS OF NOVARQ";


        const divider =
            document.createElement("div");

        divider.className =
            "novarq-team-divider";


        const list =
            document.createElement("ol");

        list.className =
            "novarq-team-list";


        /* -------------------------------------------------
           TEAM MEMBERS
        ------------------------------------------------- */

        teamMembers.forEach(function (name, index) {

            const member =
                document.createElement("li");

            member.className =
                "novarq-team-member";


            const number =
                document.createElement("span");

            number.className =
                "novarq-team-number";

            number.textContent =
                String(index + 1).padStart(2, "0");


            const nameElement =
                document.createElement("span");

            nameElement.className =
                "novarq-team-name";

            nameElement.textContent =
                name;


            member.appendChild(number);

            member.appendChild(nameElement);

            list.appendChild(member);

        });


        content.appendChild(kicker);

        content.appendChild(title);

        content.appendChild(divider);

        content.appendChild(list);


        /* -------------------------------------------------
           BUILD
        ------------------------------------------------- */

        overlay.appendChild(blackout);

        overlay.appendChild(content);

        document.body.appendChild(overlay);


        return overlay;

    }



    /* =====================================================
       START CINEMATIC
    ===================================================== */

    function startNovarqTeamAnimation() {

        if (animationRunning) {
            return;
        }

        animationRunning = true;


        /* -------------------------------------------------
           LOGO CLICK EFFECT
        ------------------------------------------------- */

        const logo =
            document.querySelector(
                ".brand-mark img"
            );


        if (logo) {

            logo.classList.add(
                "novarq-logo-clicking"
            );


            setTimeout(function () {

                logo.classList.remove(
                    "novarq-logo-clicking"
                );

            }, 500);

        }


        /* -------------------------------------------------
           CREATE
        ------------------------------------------------- */

        const overlay =
            createNovarqTeamOverlay();


        /* -------------------------------------------------
           LOCK SCROLL
        ------------------------------------------------- */

        document.documentElement.style.overflow =
            "hidden";

        document.body.style.overflow =
            "hidden";


        /* -------------------------------------------------
           CENTER → FULL BLACK
        ------------------------------------------------- */

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                overlay.classList.add(
                    "blackout-expand"
                );

            });

        });


        /* -------------------------------------------------
           SHOW CONTENT
        ------------------------------------------------- */

        setTimeout(function () {

            overlay.classList.add(
                "show-content"
            );

        }, 1100);


        /* -------------------------------------------------
           NAMES ONE BY ONE
        ------------------------------------------------- */

        const members =
            overlay.querySelectorAll(
                ".novarq-team-member"
            );


        members.forEach(function (member, index) {

            setTimeout(function () {

                member.classList.add(
                    "visible"
                );

            }, 1600 + (index * 560));

        });


        /* -------------------------------------------------
           HOLD
        ------------------------------------------------- */

        const lastNameTime =
            1600 +
            ((members.length - 1) * 560);


        const holdTime =
            lastNameTime + 3500;


        /* =================================================
           EXIT
           FULL BLACK → CENTER → DISAPPEAR
        ================================================= */

        setTimeout(function () {

            overlay.classList.add(
                "exit-animation"
            );


            /*
               Give the content a moment to disappear.
            */

            setTimeout(function () {

                overlay.classList.add(
                    "blackout-collapse"
                );

            }, 100);


            /*
               Remove after the center-collapse
               animation has finished.
            */

            setTimeout(function () {

                overlay.remove();


                document.documentElement.style.overflow =
                    "";

                document.body.style.overflow =
                    "";

                animationRunning = false;

            }, 1050);


        }, holdTime);

    }



    /* =====================================================
       LOGO CLICK LISTENER
    ===================================================== */

    function setupNovarqLogoAnimation() {

        const logo =
            document.querySelector(
                ".brand-mark img"
            );


        if (!logo) {
            return;
        }


        logo.style.cursor =
            "pointer";


        logo.setAttribute(
            "title",
            "NOVARQ Original Team"
        );


        logo.addEventListener(
            "click",
            startNovarqTeamAnimation
        );

    }



    /* =====================================================
       INIT
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            setupNovarqLogoAnimation
        );

    } else {

        setupNovarqLogoAnimation();

    }

})();
/* =========================================================
   NOVARQ CINEMATIC — FINAL DUST DISSOLVE OVERRIDE
   Paste at the VERY END of script.js
========================================================= */

(function () {

    const TEAM = [
        "SHUBHAM RAJ SHARMA",
        "PAARIJAAT",
        "RO LI BI ANN",
        "SURAJ KUMAR SINGH",
        "AKASH KUMAR",
        "RISHU RAJ"
    ];

    let running = false;


    function createDustCinematic() {

        const overlay = document.createElement("div");
        overlay.className = "novarq-final-cinematic";


        /* BLACK SCREEN */

        const black = document.createElement("div");
        black.className = "novarq-final-black";


        /* CONTENT */

        const content = document.createElement("div");
        content.className = "novarq-final-content";


        const kicker = document.createElement("div");
        kicker.className = "novarq-final-kicker";
        kicker.textContent = "NOVARQ • ORIGINAL CORE";


        const title = document.createElement("h1");
        title.className = "novarq-final-title";
        title.textContent = "OG TEAM MEMBERS OF NOVARQ";


        const names = document.createElement("div");
        names.className = "novarq-final-names";


        TEAM.forEach(function (name, index) {

            const item = document.createElement("div");

            item.className = "novarq-final-name";

            item.textContent = name;

            item.style.setProperty(
                "--name-index",
                index
            );

            names.appendChild(item);

        });


        content.appendChild(kicker);
        content.appendChild(title);
        content.appendChild(names);

        overlay.appendChild(black);
        overlay.appendChild(content);

        document.body.appendChild(overlay);


        return {
            overlay,
            black,
            content,
            names
        };
    }



    function createDustParticles(overlay) {

        const dust = document.createElement("div");

        dust.className = "novarq-final-dust";


        const size = 12;

        const cols =
            Math.ceil(window.innerWidth / size);

        const rows =
            Math.ceil(window.innerHeight / size);


        for (let y = 0; y < rows; y++) {

            for (let x = 0; x < cols; x++) {

                const particle =
                    document.createElement("span");

                particle.className =
                    "novarq-final-particle";


                particle.style.left =
                    (x * size) + "px";

                particle.style.top =
                    (y * size) + "px";


                particle.style.setProperty(
                    "--dx",
                    ((Math.random() - 0.5) * 100) + "px"
                );

                particle.style.setProperty(
                    "--dy",
                    ((Math.random() - 0.5) * 100) + "px"
                );

                particle.style.setProperty(
                    "--delay",
                    (Math.random() * 650) + "ms"
                );


                dust.appendChild(particle);

            }

        }


        overlay.appendChild(dust);

        return dust;
    }



    function startFinalCinematic() {

        if (running) return;

        running = true;


        const logo =
            document.querySelector(".brand-mark img");


        if (!logo) {

            running = false;

            return;

        }


        /* Logo click */

        logo.classList.add(
            "novarq-logo-clicking"
        );


        setTimeout(function () {

            logo.classList.remove(
                "novarq-logo-clicking"
            );

        }, 500);


        /* Create */

        const scene =
            createDustCinematic();


        const overlay =
            scene.overlay;


        const black =
            scene.black;


        const content =
            scene.content;


        /* Lock scroll */

        document.documentElement.style.overflow =
            "hidden";

        document.body.style.overflow =
            "hidden";


        /* -------------------------------------------------
           ENTRY
           CENTER → FULL BLACK
        ------------------------------------------------- */

        requestAnimationFrame(function () {

            requestAnimationFrame(function () {

                overlay.classList.add(
                    "enter"
                );

            });

        });


        /* -------------------------------------------------
           SHOW TITLE
        ------------------------------------------------- */

        setTimeout(function () {

            overlay.classList.add(
                "show"
            );

        }, 1050);


        /* -------------------------------------------------
           SHOW NAMES ONE BY ONE
        ------------------------------------------------- */

        const nameElements =
            overlay.querySelectorAll(
                ".novarq-final-name"
            );


        nameElements.forEach(function (name, index) {

            setTimeout(function () {

                name.classList.add(
                    "visible"
                );

            }, 1550 + (index * 560));

        });


        /* -------------------------------------------------
           HOLD
        ------------------------------------------------- */

        const lastName =
            1550 +
            ((TEAM.length - 1) * 560);


        const hold =
            lastName + 3500;


        /* =================================================
           EXIT — DUST DISSOLVE
        ================================================= */

        setTimeout(function () {

            overlay.classList.add(
                "leaving"
            );


            /*
               Wait for the content to fade slightly,
               then break the black screen into dust.
            */

            setTimeout(function () {

                const dust =
                    createDustParticles(
                        overlay
                    );


                requestAnimationFrame(function () {

                    dust.classList.add(
                        "active"
                    );

                });

            }, 280);


            /*
               Remove the complete cinematic after
               particles have disappeared.
            */

            setTimeout(function () {

                overlay.remove();

                document.documentElement.style.overflow =
                    "";

                document.body.style.overflow =
                    "";

                running = false;

            }, 1450);


        }, hold);

    }



    /* =====================================================
       FIND LOGO
    ===================================================== */

    function initFinalCinematic() {

        const logo =
            document.querySelector(
                ".brand-mark img"
            );


        if (!logo) return;


        /*
           Prevent the old NOVARQ cinematic
           listener from controlling this click.
        */

        const newLogo =
            logo.cloneNode(true);


        logo.parentNode.replaceChild(
            newLogo,
            logo
        );


        newLogo.style.cursor =
            "pointer";


        newLogo.setAttribute(
            "title",
            "NOVARQ Original Team"
        );


        newLogo.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                startFinalCinematic();

            }
        );

    }



    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initFinalCinematic
        );

    } else {

        initFinalCinematic();

    }

})();
