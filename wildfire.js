const { useState } = React;

function PipelineExplorer() {
    const steps = [
        {
            id: "fires",
            title: "Base des feux",
            script: "load_fires.py",
            icon: "🔥",
            role: "Construire la table centrale du projet.",
            input: "Shapefiles historiques 1972–2020 et 2021–2024.",
            output: "Une ligne par feu avec fire_uid, t0, année, taille finale et géométrie.",
            details: [
                "Charge et fusionne les fichiers historiques de feux.",
                "Nettoie les identifiants, les dates, la cause et la géométrie.",
                "Crée une date de référence t0 à partir des dates disponibles.",
                "Crée fire_uid, la clé utilisée pour toutes les jointures."
            ],
            note: "C’est le point de départ du pipeline : chaque feu devient une observation unique.",
            visual: "base"
        },
        {
            id: "era5",
            title: "Météo ERA5",
            script: "load_era5.py + build_meteo_features.py",
            icon: "🌦️",
            role: "Associer les conditions météo pré-feu à chaque incendie.",
            input: "Fichiers NetCDF ERA5 mensuels.",
            output: "Variables météo agrégées : température, précipitations, vent, VPD, neige.",
            details: [
                "Lit les fichiers ERA5 par variable, année et mois.",
                "Repère le pixel météo le plus proche de chaque feu.",
                "Transforme les données en table longue fire_uid × date.",
                "Agrège ensuite les valeurs sur des fenêtres pre3, pre7, pre14 et pre30."
            ],
            note: "La table longue permet de résumer les conditions météo juste avant l’ignition.",
            visual: "timeline"
        },
        {
            id: "fwi",
            title: "Indices FWI",
            script: "load_fwi.py + build_fwi_features.py",
            icon: "📈",
            role: "Décrire le niveau de danger d’incendie avant le départ du feu.",
            input: "FFMC, ISI, BUI et FWI quotidiens.",
            output: "Statistiques et seuils de danger incendie sur plusieurs fenêtres pré-feu.",
            details: [
                "Lit les fichiers NetCDF des indices canadiens de danger incendie.",
                "Extrait les valeurs quotidiennes au point de chaque feu.",
                "Construit une série temporelle par fire_uid.",
                "Calcule moyennes, maximums, tendances et jours au-dessus de seuils."
            ],
            note: "Ces variables représentent le contexte de danger feu avant la propagation.",
            visual: "timeline"
        },
        {
            id: "ndvi",
            title: "NDVI / végétation",
            script: "load_ndvi.py + build_ndvi_features.py",
            icon: "🌲",
            role: "Représenter l’état de la végétation et du combustible.",
            input: "Rasters NDVI annuels et calendrier des bandes.",
            output: "Features NDVI multi-échelles à 2 km, 5 km, 10 km et 25 km.",
            details: [
                "Lit les rasters NDVI annuels.",
                "Associe chaque bande raster à une date grâce au calendrier NDVI.",
                "Échantillonne une grille autour de chaque feu.",
                "Calcule moyenne, min, max, validité, fraction brûlable et fragmentation."
            ],
            note: "Cette étape est très visuelle : elle explique pourquoi le modèle regarde autour du feu, pas seulement au point exact.",
            visual: "ndvi"
        },
        {
            id: "spatial",
            title: "Spatial / topographie",
            script: "build_spatial_features.py",
            icon: "🗺️",
            role: "Décrire le contexte physique autour du feu.",
            input: "DEM, landcover, routes et coordonnées du feu.",
            output: "Altitude, pente, rugosité, occupation du sol, accessibilité et contexte spatial.",
            details: [
                "Crée des points de référence pour chaque feu.",
                "Calcule des buffers autour des feux.",
                "Extrait des statistiques raster dans ces buffers.",
                "Ajoute des variables d’accessibilité et de contexte géographique."
            ],
            note: "Ces variables donnent au modèle une idée du terrain et de l’isolement du feu.",
            visual: "spatial"
        },
        {
            id: "history",
            title: "Historique des feux",
            script: "build_fire_history_features.py",
            icon: "🕒",
            role: "Ajouter une mémoire spatiale du risque passé.",
            input: "Feux historiques, dates et coordonnées.",
            output: "Nombre de feux voisins, gros feux passés, récence et taille moyenne passée.",
            details: [
                "Recherche les feux voisins dans un rayon donné.",
                "Garde seulement les feux antérieurs au feu courant.",
                "Calcule des fenêtres de 3 ans, 5 ans et 5 à 10 ans.",
                "Produit des variables de fréquence, récence et intensité historique."
            ],
            note: "Le code évite la fuite temporelle en utilisant seulement les feux déjà survenus.",
            visual: "history"
        },
        {
            id: "scanfi",
            title: "SCANFI statique",
            script: "build_scanfi_static_features.py",
            icon: "🧱",
            role: "Ajouter des variables statiques sur le contexte non brûlable.",
            input: "Raster SCANFI landcover.",
            output: "Fractions d’eau, de roche, de non-brûlable et proxy brûlable.",
            details: [
                "Crée des buffers autour des points de feu.",
                "Lit les classes SCANFI dans chaque buffer.",
                "Calcule la fraction d’eau et de roche.",
                "Ajoute ces variables au modèle spatial existant."
            ],
            note: "Ces variables sont utiles, mais doivent être présentées comme un contexte statique approximatif.",
            visual: "spatial"
        },
        {
            id: "store",
            title: "Feature store final",
            script: "build_features_store.py",
            icon: "🧩",
            role: "Assembler toutes les sources dans une table finale.",
            input: "Base feux + spatial + météo + FWI + historique + NDVI.",
            output: "Une table finale prête pour l’entraînement du modèle.",
            details: [
                "Filtre les années utilisées par le modèle.",
                "Vérifie que chaque table contient un fire_uid unique.",
                "Fusionne les blocs avec des jointures one-to-one.",
                "Nettoie certaines valeurs manquantes et crée des indicateurs de missingness."
            ],
            note: "C’est la dernière étape avant la modélisation : une ligne représente un feu.",
            visual: "store"
        }
    ];

    const [activeId, setActiveId] = useState("fires");
    const active = steps.find((step) => step.id === activeId);

    return (
        <div className="pipeline-explainer">
            <div className="pipeline-intro-card">
                <h3>Du fichier brut au feature store</h3>
                <p>
                    Le pipeline est organisé comme une chaîne de production. Les données brutes sont
                    d’abord standardisées, ensuite converties en séries temporelles ou variables spatiales,
                    puis fusionnées dans une table finale utilisée par le modèle.
                </p>

                <div className="pipeline-flow">
                    <span>Données brutes</span>
                    <strong>→</strong>
                    <span>Tables longues</span>
                    <strong>→</strong>
                    <span>Features</span>
                    <strong>→</strong>
                    <span>Feature store</span>
                    <strong>→</strong>
                    <span>Modèle</span>
                </div>
            </div>

            <div className="pipeline-explainer-grid">
                <div className="pipeline-menu">
                    {steps.map((step) => (
                        <button
                            key={step.id}
                            className={
                                activeId === step.id
                                    ? "pipeline-menu-item active"
                                    : "pipeline-menu-item"
                            }
                            onClick={() => setActiveId(step.id)}
                        >
                            <span className="pipeline-menu-icon">{step.icon}</span>
                            <span>
                                <strong>{step.title}</strong>
                                <small>{step.script}</small>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="pipeline-code-card">
                    <div className="pipeline-code-header">
                        <span className="script-badge">{active.script}</span>
                        <h3>{active.icon} {active.title}</h3>
                    </div>

                    <PipelineVisual type={active.visual} />

                    <div className="pipeline-three-cols">
                        <div>
                            <h4>Rôle</h4>
                            <p>{active.role}</p>
                        </div>

                        <div>
                            <h4>Entrées</h4>
                            <p>{active.input}</p>
                        </div>

                        <div>
                            <h4>Sortie</h4>
                            <p>{active.output}</p>
                        </div>
                    </div>

                    <div className="code-explanation-box">
                        <h4>Ce que fait le code</h4>
                        <ul>
                            {active.details.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="method-note">
                        <strong>Point méthodologique :</strong> {active.note}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PipelineVisual({ type }) {
    if (type === "timeline") {
        return (
            <div className="pipeline-visual-card">
                <div className="mini-timeline">
                    <div className="mini-timeline-line"></div>

                    <div className="mini-window mini-pre30">pre30</div>
                    <div className="mini-window mini-pre14">pre14</div>
                    <div className="mini-window mini-pre7">pre7</div>
                    <div className="mini-window mini-pre3">pre3</div>

                    <div className="mini-t0">
                        t0
                        <small>départ</small>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "ndvi") {
        return (
            <div className="pipeline-visual-card">
                <div className="ndvi-visual">
                    <div className="ndvi-circle ndvi-25">25 km</div>
                    <div className="ndvi-circle ndvi-10">10 km</div>
                    <div className="ndvi-circle ndvi-5">5 km</div>
                    <div className="ndvi-circle ndvi-2">2 km</div>
                    <div className="ndvi-fire">🔥</div>
                </div>
            </div>
        );
    }

    if (type === "store") {
        return (
            <div className="pipeline-visual-card">
                <div className="store-visual">
                    <div className="store-sources">
                        <span>Feux</span>
                        <span>Spatial</span>
                        <span>Météo</span>
                        <span>FWI</span>
                        <span>NDVI</span>
                        <span>Historique</span>
                    </div>

                    <div className="store-down-arrow">↓</div>

                    <div className="store-final">
                        feature_store_final.parquet
                        <small>1 ligne = 1 feu</small>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "history") {
        return (
            <div className="pipeline-visual-card">
                <div className="history-visual">
                    <div className="history-radius">rayon 10 km</div>
                    <div className="history-current">🔥</div>
                    <div className="history-dot dot-a">ancien feu</div>
                    <div className="history-dot dot-b">gros feu</div>
                    <div className="history-dot dot-c">ancien feu</div>
                </div>
            </div>
        );
    }

    if (type === "spatial") {
        return (
            <div className="pipeline-visual-card">
                <div className="spatial-visual">
                    <div className="terrain-layer">Topographie</div>
                    <div className="terrain-layer">Landcover</div>
                    <div className="terrain-layer">Routes</div>
                    <div className="terrain-layer">Buffers</div>
                </div>
            </div>
        );
    }

    return (
        <div className="pipeline-visual-card">
            <div className="base-visual">
                <div className="base-table">
                    <div>fire_uid</div>
                    <div>t0</div>
                    <div>SIZE_HA</div>
                    <div>geometry</div>
                </div>
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
                    <p className="metric-change">A completer</p>
                    <p>ex Réduction de l’erreur de prédiction sur la taille transformée.</p>
                </div>

                <div className="result-card">
                    <h3>Bigfire F1</h3>
                    <p className="metric-change">a completer</p>
                    <p>Meilleur équilibre entre précision et rappel pour les feux ≥ 1000 ha.</p>
                </div>

                <div className="result-card">
                    <h3>Recall extrême</h3>
                    <p className="metric-change">a completer</p>
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