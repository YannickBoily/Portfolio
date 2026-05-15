const { useState } = React;

function PipelineExplorer() {
    const sources = [
        {
            name: "Feux historiques",
            detail: "Base principale du projet. Elle contient les feux, leur date d’ignition, leur taille finale et les identifiants utilisés pour fusionner les autres sources."
        },
        {
            name: "Météo ERA5",
            detail: "Variables météo comme température, précipitations, vent, point de rosée, VPD et neige, agrégées sur des fenêtres avant l’ignition."
        },
        {
            name: "FWI",
            detail: "Indices de danger incendie, comme FFMC, ISI, BUI et FWI. Ces variables aident à représenter les conditions favorables à la propagation."
        },
        {
            name: "NDVI",
            detail: "Variables de végétation et de combustible calculées avant le feu, à plusieurs échelles spatiales et temporelles."
        },
        {
            name: "Spatial / topographie",
            detail: "Variables comme l’élévation, la pente, la rugosité, les routes, les buffers multi-échelles et le contexte géographique autour du point d’ignition."
        },
        {
            name: "Historique des feux",
            detail: "Variables décrivant l’activité passée des feux autour du point d’ignition, par exemple le nombre de feux récents dans un rayon donné."
        },
        {
            name: "SCANFI statique",
            detail: "Variables statiques comme les fractions d’eau, de roche et de zones non brûlables, utilisées avec prudence pour limiter la fuite temporelle."
        }
    ];

    const [selected, setSelected] = useState(sources[0]);

    return (
        <div>
            <div className="pipeline-grid">
                <div className="pipeline-column">
                    <h3>Sources</h3>

                    {sources.map((source) => (
                        <div
                            key={source.name}
                            className={
                                selected.name === source.name
                                    ? "pipeline-item active"
                                    : "pipeline-item"
                            }
                            onClick={() => setSelected(source)}
                        >
                            {source.name}
                        </div>
                    ))}
                </div>

                <div className="pipeline-arrow">→</div>

                <div className="pipeline-column">
                    <h3>Préparation</h3>

                    <div className="pipeline-item">Nettoyage</div>
                    <div className="pipeline-item">Jointures par fire_uid</div>
                    <div className="pipeline-item">Contrôle qualité</div>
                    <div className="pipeline-item">Anti-leakage</div>
                </div>

                <div className="pipeline-arrow">→</div>

                <div className="pipeline-column">
                    <h3>Sortie</h3>

                    <div className="pipeline-item active">
                        feature_store_final.parquet
                    </div>

                    <div className="pipeline-item">
                        Entraînement
                    </div>

                    <div className="pipeline-item">
                        Calibration
                    </div>

                    <div className="pipeline-item">
                        Test temporel
                    </div>
                </div>
            </div>

            <div className="pipeline-detail">
                <h3>{selected.name}</h3>
                <p>{selected.detail}</p>
            </div>
        </div>
    );
}

function FeatureEngineeringTabs() {
    const groups = {
        "Météo ERA5": {
            windows: "pre3, pre7, pre14, pre30",
            examples: "Température, précipitations, vent, VPD, neige, jours secs, tendances.",
            role: "Capturer les conditions météo qui précèdent l’ignition et qui peuvent favoriser la propagation."
        },
        "FWI": {
            windows: "pre3, pre7, pre14, pre30",
            examples: "FFMC, ISI, BUI, FWI, jours dépassant certains seuils.",
            role: "Représenter le danger incendie à partir d’indices spécialisés."
        },
        "NDVI": {
            windows: "pre7, pre14, pre30, pre60",
            examples: "NDVI moyen, min, max, valid_frac, burnable_frac, fragmentation, combustible connecté.",
            role: "Décrire l’état de la végétation et la disponibilité du combustible."
        },
        "Spatial": {
            windows: "Buffers multi-échelles",
            examples: "Élévation, pente, ruggedness, routes, densité routière, contexte autour de l’ignition.",
            role: "Décrire le contexte physique et géographique autour du feu."
        },
        "Historique": {
            windows: "3 ans, 5 ans, 5 à 10 ans",
            examples: "Nombre de feux récents, nombre de gros feux récents, historique spatial.",
            role: "Ajouter une mémoire spatiale du risque passé."
        },
        "Anti-leakage": {
            windows: "Contrôle méthodologique",
            examples: "Retrait de variables dérivées de la géométrie finale du feu et sélection prudente des couches SCANFI.",
            role: "Éviter que le modèle utilise de l’information qui ne serait pas disponible au moment de la prédiction."
        }
    };

    const names = Object.keys(groups);
    const [active, setActive] = useState(names[0]);
    const current = groups[active];

    return (
        <div>
            <div className="tabs">
                {names.map((name) => (
                    <button
                        key={name}
                        className={
                            active === name
                                ? "tab-button active"
                                : "tab-button"
                        }
                        onClick={() => setActive(name)}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="feature-panel">
                <h3>{active}</h3>

                <div className="feature-grid">
                    <div className="feature-box">
                        <strong>Fenêtres / échelles</strong>
                        <p>{current.windows}</p>
                    </div>

                    <div className="feature-box">
                        <strong>Exemples de variables</strong>
                        <p>{current.examples}</p>
                    </div>

                    <div className="feature-box">
                        <strong>Rôle dans le modèle</strong>
                        <p>{current.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TemporalValidation() {
    const years = [2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    const [testYear, setTestYear] = useState(2013);

    const trainStart = 2000;
    const trainEnd = testYear - 4;
    const calibStart = testYear - 3;
    const calibEnd = testYear - 1;

    return (
        <div className="timeline-card">
            <h3>Choisir une année test</h3>

            <div className="year-buttons">
                {years.map((year) => (
                    <button
                        key={year}
                        className={
                            testYear === year
                                ? "year-button active"
                                : "year-button"
                        }
                        onClick={() => setTestYear(year)}
                    >
                        {year}
                    </button>
                ))}
            </div>

            <div className="split-grid">
                <div className="split-card">
                    <strong>Train</strong>
                    <span>{trainStart}–{trainEnd}</span>
                </div>

                <div className="split-card">
                    <strong>Calibration</strong>
                    <span>{calibStart}–{calibEnd}</span>
                </div>

                <div className="split-card">
                    <strong>Test</strong>
                    <span>{testYear}</span>
                </div>
            </div>
        </div>
    );
}

function ModelArchitecture() {
    return (
        <div className="model-architecture">
            <div className="model-stack">
                <div className="model-box">
                    <h3>Classifieur bigfire</h3>
                    <p>Prédit la probabilité qu’un feu atteigne au moins 1000 hectares.</p>
                </div>

                <div className="model-box">
                    <h3>Classifieur ordinal</h3>
                    <p>Prédit une classe de taille : petit, moyen, grand ou extrême.</p>
                </div>

                <div className="model-box">
                    <h3>Régresseur log-size</h3>
                    <p>Prédit une taille continue avec une cible transformée en log1p(SIZE_HA).</p>
                </div>
            </div>

            <div className="pipeline-arrow">→</div>

            <div className="decision-box">
                <h3>Décision finale calibrée</h3>
                <p>
                    Les sorties des modèles sont combinées pour produire une alerte gros feu,
                    une alerte feu extrême et une classe finale.
                </p>
                <p>
                    L’objectif est de réduire les erreurs catastrophiques, surtout les feux extrêmes
                    prédits comme de petits feux.
                </p>
            </div>
        </div>
    );
}

function ResultsSummary() {
    return (
        <div>
            <div className="results-grid">
                <div className="result-card">
                    <h3>MAE log</h3>
                    <p className="metric-change">1.765 → 1.502</p>
                    <p>Réduction de l’erreur de prédiction sur la taille transformée.</p>
                </div>

                <div className="result-card">
                    <h3>Bigfire F1</h3>
                    <p className="metric-change">0.559 → 0.651</p>
                    <p>Meilleur équilibre entre précision et rappel pour les feux ≥ 1000 ha.</p>
                </div>

                <div className="result-card">
                    <h3>Recall extrême</h3>
                    <p className="metric-change">0.098 → 0.492</p>
                    <p>Amélioration importante de la détection des feux ≥ 10000 ha.</p>
                </div>
            </div>

            <div className="result-card" style={{ marginTop: "1.5rem" }}>
                <h3>Matrice de confusion — alertes gros feux</h3>

                <table className="confusion-mini">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Prédit non gros feu</th>
                            <th>Prédit gros feu</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <th>Réel non gros feu</th>
                            <td>1077</td>
                            <td>142</td>
                        </tr>

                        <tr>
                            <th>Réel gros feu</th>
                            <td>33</td>
                            <td>163</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

ReactDOM.createRoot(
    document.getElementById("react-wildfire-pipeline")
).render(<PipelineExplorer />);

ReactDOM.createRoot(
    document.getElementById("react-wildfire-features")
).render(<FeatureEngineeringTabs />);

ReactDOM.createRoot(
    document.getElementById("react-wildfire-validation")
).render(<TemporalValidation />);

ReactDOM.createRoot(
    document.getElementById("react-wildfire-model")
).render(<ModelArchitecture />);

ReactDOM.createRoot(
    document.getElementById("react-wildfire-results")
).render(<ResultsSummary />);