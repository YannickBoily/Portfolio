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
    const groups = [
        {
            id: "temporal",
            title: "Fenêtres temporelles",
            icon: "⏱️",
            script: "meteo_features.py / fwi_features.py / ndvi_features.py",
            summary: "Les séries quotidiennes sont transformées en variables résumées avant le départ du feu.",
            why: "Un feu ne dépend pas seulement de la météo du jour. Les conditions accumulées dans les jours précédents peuvent être plus importantes.",
            examples: [
                "pre3 : conditions très récentes",
                "pre7 : dernière semaine",
                "pre14 : contexte court terme",
                "pre30 / pre60 : contexte plus stable"
            ],
            featureExamples: [
                "pre7_temp_c_mean",
                "pre14_fwi_max",
                "pre30_precip_mm_sum",
                "pre60_ndvi_25km_mean"
            ],
            visual: "time"
        },
        {
            id: "meteo",
            title: "Météo ERA5",
            icon: "🌦️",
            script: "build_meteo_features.py",
            summary: "Les variables ERA5 sont converties en indicateurs météo interprétables.",
            why: "La température, le vent, la sécheresse de l’air, la pluie et la neige influencent directement la probabilité qu’un feu devienne difficile à contrôler.",
            examples: [
                "Température moyenne, maximale et minimale",
                "Précipitations cumulées",
                "Vitesse du vent",
                "VPD : déficit de pression de vapeur",
                "Présence ou absence de neige"
            ],
            featureExamples: [
                "pre7_vpd_mean",
                "pre14_wind_max",
                "pre30_rain_days_ge_1mm",
                "flag_pre7_persistent_hot_dry"
            ],
            visual: "meteo"
        },
        {
            id: "fwi",
            title: "Indices FWI",
            icon: "🔥",
            script: "build_fwi_features.py",
            summary: "Les indices canadiens de danger incendie sont agrégés avant l’ignition.",
            why: "Les indices FWI résument l’état du combustible et les conditions favorables à la propagation.",
            examples: [
                "FFMC : humidité des combustibles fins",
                "ISI : potentiel de propagation initiale",
                "BUI : combustible disponible",
                "FWI : intensité potentielle du feu"
            ],
            featureExamples: [
                "pre7_ffmc_mean",
                "pre14_isi_max",
                "pre30_bui_mean",
                "pre7_fwi_days_ge_20"
            ],
            visual: "fwi"
        },
        {
            id: "ndvi",
            title: "NDVI et combustible",
            icon: "🌲",
            script: "build_ndvi_features.py",
            summary: "Le NDVI est utilisé comme proxy de végétation et de combustible autour du feu.",
            why: "La végétation disponible autour d’un feu peut influencer sa croissance. Le code extrait donc des signaux à plusieurs distances.",
            examples: [
                "NDVI moyen autour du feu",
                "NDVI minimum et maximum",
                "Hétérogénéité spatiale dans le buffer",
                "Fraction de pixels potentiellement brûlables",
                "Fragmentation des zones de végétation"
            ],
            featureExamples: [
                "pre30_ndvi_2km_mean",
                "pre30_ndvi_25km_valid_frac",
                "ndvi_2km_mean_delta_pre7_pre30",
                "pre60_ndvi_25km_largest_burnable_component_frac_mean"
            ],
            visual: "ndvi"
        },
        {
            id: "spatial",
            title: "Topographie et accessibilité",
            icon: "🗺️",
            script: "build_spatial_features.py",
            summary: "Le contexte physique autour du feu est résumé avec des variables spatiales.",
            why: "Le relief, l’occupation du sol et l’accès routier peuvent influencer la propagation et la capacité d’intervention.",
            examples: [
                "Altitude moyenne et variation du relief",
                "Pente et rugosité",
                "Occupation du sol dans différents buffers",
                "Distance à la route la plus proche",
                "Score d’isolement ou de remoteness"
            ],
            featureExamples: [
                "dem_10km_mean",
                "topo_25km_slope_p90",
                "road_25km_dist_nearest_km",
                "road_25km_remote_simple"
            ],
            visual: "spatial"
        },
        {
            id: "history",
            title: "Historique local des feux",
            icon: "🕒",
            script: "build_fire_history_features.py",
            summary: "Le pipeline ajoute une mémoire spatiale basée sur les feux passés autour du feu courant.",
            why: "Une zone récemment brûlée ou une zone avec beaucoup de feux passés peut avoir un contexte de risque différent.",
            examples: [
                "Nombre de feux voisins dans les dernières années",
                "Nombre de gros feux passés",
                "Temps depuis le dernier feu proche",
                "Taille moyenne ou maximale des feux précédents"
            ],
            featureExamples: [
                "hist_fire_count_10km_3y",
                "hist_bigfire_count_10km_5y",
                "hist_time_since_last_fire_10km_days",
                "hist_prev_fire_size_max_10km_5y"
            ],
            visual: "history"
        },
        {
            id: "quality",
            title: "Qualité et valeurs manquantes",
            icon: "🧪",
            script: "build_features_store.py",
            summary: "Le pipeline conserve des indicateurs de couverture et de valeurs manquantes.",
            why: "Une valeur manquante peut parfois être informative : absence de données, couverture faible, neige manquante, NDVI invalide, etc.",
            examples: [
                "Couverture temporelle des fenêtres météo",
                "Flags de faible couverture",
                "Fraction NDVI valide ou invalide",
                "Indicateurs de missingness pour l’historique des feux"
            ],
            featureExamples: [
                "pre7_meteo_temporal_coverage",
                "flag_pre30_fwi_low_temporal_coverage",
                "pre30_ndvi_25km_invalid_frac",
                "hist_time_since_last_fire_10km_days_missing"
            ],
            visual: "quality"
        }
    ];

    const [activeId, setActiveId] = useState("temporal");
    const active = groups.find((group) => group.id === activeId);

    return (
        <div className="feature-engineering-explainer">
            <div className="feature-intro-card">
                <h3>Transformer les données brutes en signaux prédictifs</h3>
                <p>
                    Le feature engineering transforme les séries météo, FWI, NDVI et les données
                    spatiales en variables numériques utilisables par le modèle. L’objectif est de
                    représenter le contexte du feu avant qu’il devienne grand ou extrême.
                </p>

                <div className="feature-principles">
                    <div>
                        <strong>Temporel</strong>
                        <span>Fenêtres avant t0</span>
                    </div>
                    <div>
                        <strong>Spatial</strong>
                        <span>Buffers autour du feu</span>
                    </div>
                    <div>
                        <strong>Robuste</strong>
                        <span>Flags de qualité</span>
                    </div>
                    <div>
                        <strong>Modèle</strong>
                        <span>1 ligne = 1 feu</span>
                    </div>
                </div>
            </div>

            <div className="feature-layout">
                <div className="feature-tabs-v2">
                    {groups.map((group) => (
                        <button
                            key={group.id}
                            className={
                                activeId === group.id
                                    ? "feature-tab-v2 active"
                                    : "feature-tab-v2"
                            }
                            onClick={() => setActiveId(group.id)}
                        >
                            <span className="feature-tab-icon">{group.icon}</span>
                            <span>
                                <strong>{group.title}</strong>
                                <small>{group.script}</small>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="feature-detail-v2">
                    <div className="feature-detail-header">
                        <span className="script-badge">{active.script}</span>
                        <h3>{active.icon} {active.title}</h3>
                        <p>{active.summary}</p>
                    </div>

                    <FeatureVisual type={active.visual} />

                    <div className="feature-explain-grid">
                        <div className="feature-why-box">
                            <h4>Pourquoi cette famille de features ?</h4>
                            <p>{active.why}</p>
                        </div>

                        <div className="feature-example-box">
                            <h4>Transformations principales</h4>
                            <ul>
                                {active.examples.map((example, index) => (
                                    <li key={index}>{example}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="feature-name-box">
                        <h4>Exemples de noms de variables</h4>
                        <div className="feature-name-list">
                            {active.featureExamples.map((feature, index) => (
                                <code key={index}>{feature}</code>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="feature-method-card">
                <h3>Logique générale du feature engineering</h3>

                <div className="feature-method-steps">
                    <div>
                        <span>1</span>
                        <strong>Aligner sur t0</strong>
                        <p>Chaque observation est replacée par rapport à la date de départ du feu.</p>
                    </div>

                    <div>
                        <span>2</span>
                        <strong>Créer des fenêtres</strong>
                        <p>Les jours avant le feu sont regroupés en fenêtres comme pre7, pre14 ou pre30.</p>
                    </div>

                    <div>
                        <span>3</span>
                        <strong>Résumer les signaux</strong>
                        <p>Le code calcule des moyennes, maximums, sommes, tendances, seuils et ratios.</p>
                    </div>

                    <div>
                        <span>4</span>
                        <strong>Contrôler la qualité</strong>
                        <p>Les flags indiquent les fenêtres incomplètes ou les données manquantes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
function FeatureVisual({ type }) {
    if (type === "time") {
        return (
            <div className="feature-visual-card">
                <div className="feature-time-visual">
                    <div className="time-axis"></div>
                    <div className="time-block time-pre60">pre60</div>
                    <div className="time-block time-pre30">pre30</div>
                    <div className="time-block time-pre14">pre14</div>
                    <div className="time-block time-pre7">pre7</div>
                    <div className="time-marker">t0</div>
                </div>
            </div>
        );
    }

    if (type === "meteo") {
        return (
            <div className="feature-visual-card">
                <div className="meteo-visual">
                    <div className="weather-chip">Température</div>
                    <div className="weather-chip">Vent</div>
                    <div className="weather-chip">Précipitations</div>
                    <div className="weather-chip">VPD</div>
                    <div className="weather-chip">Neige</div>
                    <div className="feature-arrow-down">↓</div>
                    <div className="derived-chip">Sécheresse + chaleur + vent</div>
                </div>
            </div>
        );
    }

    if (type === "fwi") {
        return (
            <div className="feature-visual-card">
                <div className="fwi-visual">
                    <div className="fwi-box">FFMC<br /><small>combustibles fins</small></div>
                    <div className="fwi-box">ISI<br /><small>propagation</small></div>
                    <div className="fwi-box">BUI<br /><small>combustible</small></div>
                    <div className="fwi-box main">FWI<br /><small>danger global</small></div>
                </div>
            </div>
        );
    }

    if (type === "ndvi") {
        return (
            <div className="feature-visual-card">
                <div className="feature-ndvi-visual">
                    <div className="ndvi-scale-row">
                        <span>2 km</span>
                        <div className="ndvi-bar small"></div>
                    </div>
                    <div className="ndvi-scale-row">
                        <span>5 km</span>
                        <div className="ndvi-bar medium"></div>
                    </div>
                    <div className="ndvi-scale-row">
                        <span>10 km</span>
                        <div className="ndvi-bar large"></div>
                    </div>
                    <div className="ndvi-scale-row">
                        <span>25 km</span>
                        <div className="ndvi-bar xlarge"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "spatial") {
        return (
            <div className="feature-visual-card">
                <div className="spatial-feature-visual">
                    <div className="spatial-stack">DEM</div>
                    <div className="spatial-stack">Landcover</div>
                    <div className="spatial-stack">Routes</div>
                    <div className="spatial-stack">SCANFI</div>
                </div>
            </div>
        );
    }

    if (type === "history") {
        return (
            <div className="feature-visual-card">
                <div className="history-feature-visual">
                    <div className="history-center">Feu courant</div>
                    <div className="history-ring-label">10 km</div>
                    <div className="past-fire pf1">-2 ans</div>
                    <div className="past-fire pf2">-5 ans</div>
                    <div className="past-fire pf3">gros feu</div>
                </div>
            </div>
        );
    }

    return (
        <div className="feature-visual-card">
            <div className="quality-visual">
                <div className="quality-row good">Données complètes</div>
                <div className="quality-row warning">Couverture faible</div>
                <div className="quality-row missing">Valeur manquante + flag</div>
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
    const [activeBlock, setActiveBlock] = useState("xgb_binary");

    const blocks = {
        xgb_binary: {
            title: "Classifieur XGBoost binaire",
            badge: "XGBClassifier",
            role: "Détecter les feux qui dépassent 1 000 ha.",
            input: "Feature store tabulaire agrégé.",
            output: "Probabilité calibrée de gros feu.",
            detail:
                "Cette branche appartient au modèle tabulaire. Elle utilise les variables agrégées du feature store pour répondre à la question principale : ce feu risque-t-il de devenir un grand événement ?"
        },

        xgb_ordinal: {
            title: "Classifieur XGBoost ordinal",
            badge: "XGBClassifier multi-classe",
            role: "Distinguer plusieurs niveaux de taille.",
            input: "Feature store tabulaire agrégé.",
            output: "Probabilité d’appartenir à une classe de taille élevée.",
            detail:
                "Cette branche ajoute une lecture graduelle du risque avec plusieurs classes de taille : petit, moyen, grand et extrême. Elle aide le modèle à ne pas traiter tous les grands feux comme un seul groupe homogène."
        },

        xgb_regression: {
            title: "Régresseur XGBoost",
            badge: "XGBRegressor",
            role: "Conserver une estimation continue de la taille.",
            input: "Variables agrégées du feature store.",
            output: "Prédiction de log1p(SIZE_HA).",
            detail:
                "Cette branche n’utilise pas directement les séries longues. Elle utilise le feature store agrégé pour prédire une taille transformée en log, ce qui stabilise la distribution très déséquilibrée des tailles de feux."
        },

        neural: {
            title: "Branche deep learning séquentielle",
            badge: "Temporal CNN / Transformer",
            role: "Apprendre directement les trajectoires pré-feu.",
            input: "Tables longues pré-feu : météo/FWI quotidiennes et NDVI temporel.",
            output: "Score neural de grand feu et score neural de feu extrême.",
            detail:
                "Cette branche exploite les données longues jour par jour ou semaine par semaine. Contrairement aux modèles XGBoost, elle peut apprendre directement les trajectoires météo, FWI et NDVI avant l’ignition."
        },

        meta: {
            title: "Méta-modèle de fusion",
            badge: "LogisticRegression",
            role: "Fusionner les signaux XGBoost et deep learning.",
            input: "Probabilités XGBoost, score de régression et scores neural.",
            output: "Score de risque hybride.",
            detail:
                "Le méta-modèle apprend à combiner les signaux des deux branches. Il peut donner plus ou moins d’importance au deep learning selon sa contribution réelle à la détection des grands feux."
        },

        policy: {
            title: "Politique d’alerte",
            badge: "Optuna",
            role: "Transformer le score de risque en alertes opérationnelles.",
            input: "Score de risque hybride.",
            output: "Alertes selon un seuil ou un top pourcentage.",
            detail:
                "Le seuil final est calibré pour équilibrer le rappel des grands feux, la détection des feux extrêmes, la précision et le taux d’alerte."
        }
    };

    const active = blocks[activeBlock];

    return (
        <div className="model-explainer">
            <div className="model-intro-card">
                <h3>Modèle hybride multi-signal</h3>

                <p>
                    Le modèle est organisé en deux branches complémentaires. La branche tabulaire
                    utilise le feature store agrégé pour entraîner trois modèles XGBoost :
                    un classifieur binaire, un classifieur ordinal et un régresseur. La branche
                    séquentielle utilise les tables longues pré-feu pour entraîner un modèle deep
                    learning capable d’apprendre directement les trajectoires temporelles.
                </p>

                <p>
                    Les sorties de ces branches sont ensuite fusionnées dans un méta-modèle afin
                    de produire un score de risque final. Ce score est converti en alertes à l’aide
                    d’une politique de décision calibrée.
                </p>
            </div>

            <div className="model-flow-v4">
                <div className="model-two-branches">
                    <div className="model-branch-group">
                        <h4 className="model-branch-title">Branche tabulaire</h4>

                        <div className="model-source-card">
                            <strong>Feature store agrégé</strong>
                            <span>Variables météo, FWI, NDVI agrégé, spatial, historique</span>
                        </div>

                        <div className="model-flow-arrow">↓</div>

                        <div className="model-branch-row xgb-row">
                            <button
                                className={activeBlock === "xgb_binary" ? "model-node active" : "model-node"}
                                onClick={() => setActiveBlock("xgb_binary")}
                            >
                                XGBoost binaire
                                <small>P(feu ≥ 1 000 ha)</small>
                            </button>

                            <button
                                className={activeBlock === "xgb_ordinal" ? "model-node active" : "model-node"}
                                onClick={() => setActiveBlock("xgb_ordinal")}
                            >
                                XGBoost ordinal
                                <small>Classes de taille</small>
                            </button>

                            <button
                                className={activeBlock === "xgb_regression" ? "model-node active" : "model-node"}
                                onClick={() => setActiveBlock("xgb_regression")}
                            >
                                XGBoost régression
                                <small>log1p(SIZE_HA)</small>
                            </button>
                        </div>

                        <div className="branch-output-label">
                            Scores XGBoost
                        </div>
                    </div>

                    <div className="model-branch-group">
                        <h4 className="model-branch-title">Branche séquentielle</h4>

                        <div className="model-source-card neural-source">
                            <strong>Tables longues pré-feu</strong>
                            <span>Séries météo/FWI quotidiennes + NDVI temporel</span>
                        </div>

                        <div className="model-flow-arrow">↓</div>

                        <div className="model-branch-row neural-row">
                            <button
                                className={activeBlock === "neural" ? "model-node neural active" : "model-node neural"}
                                onClick={() => setActiveBlock("neural")}
                            >
                                Deep learning
                                <small>Trajectoires pré-feu</small>
                            </button>
                        </div>

                        <div className="branch-output-label neural-output">
                            Scores neural
                        </div>
                    </div>
                </div>

                <div className="merge-arrows">
                    <span>↘</span>
                    <span>↙</span>
                </div>

                <button
                    className={activeBlock === "meta" ? "model-meta-node active" : "model-meta-node"}
                    onClick={() => setActiveBlock("meta")}
                >
                    Méta-modèle de fusion
                    <small>Combine scores XGBoost + scores deep learning</small>
                </button>

                <div className="model-flow-arrow">↓</div>

                <button
                    className={activeBlock === "policy" ? "model-policy-node active" : "model-policy-node"}
                    onClick={() => setActiveBlock("policy")}
                >
                    Score de risque final + politique d’alerte
                </button>
            </div>

            <div className="model-detail-v2">
                <span className="script-badge">{active.badge}</span>
                <h3>{active.title}</h3>

                <div className="model-detail-grid">
                    <div>
                        <h4>Rôle</h4>
                        <p>{active.role}</p>
                    </div>

                    <div>
                        <h4>Entrée</h4>
                        <p>{active.input}</p>
                    </div>

                    <div>
                        <h4>Sortie</h4>
                        <p>{active.output}</p>
                    </div>
                </div>

                <div className="method-note">
                    <strong>Pourquoi :</strong> {active.detail}
                </div>
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
function NdviTimeline() {
    const frames = [
        {
            id: "day0",
            label: "J0",
            date: "Moment de l’ignition",
            image: "img/wildfire/0J.png",
            caption:
                "Au moment de l’ignition, le NDVI donne une image du contexte végétal autour du point de départ du feu. Les zones plus vertes indiquent généralement un signal de végétation plus élevé."
        },
        {
            id: "day7",
            label: "J+7",
            date: "1 semaine après l’ignition",
            image: "img/wildfire/7J.png",
            caption:
                "Une semaine après le départ du feu, le signal NDVI peut commencer à montrer des changements locaux. Cette image aide à visualiser comment le raster capte l’évolution de la végétation autour de l’événement."
        },
        {
            id: "day14",
            label: "J+14",
            date: "2 semaines après l’ignition",
            image: "img/wildfire/14J.png",
            caption:
                "Deux semaines après l’ignition, les différences spatiales deviennent plus faciles à observer. Le NDVI permet de comparer les zones où le signal de végétation reste élevé avec celles où il diminue."
        },
        {
            id: "day30",
            label: "J+30",
            date: "1 mois après l’ignition",
            image: "img/wildfire/30J.png",
            caption:
                "Un mois après le feu, le signal NDVI illustre mieux la perturbation du paysage. Cette évolution temporelle montre pourquoi les rasters satellite sont utiles pour suivre l’état de la végétation."
        },
        {
            id: "day60",
            label: "J+60",
            date: "2 mois après l’ignition",
            image: "img/wildfire/60J.png",
            caption:
                "Deux mois après l’ignition, le NDVI peut révéler des contrastes plus marqués entre les zones affectées et les zones moins touchées. Ce type de signal aide à comprendre la dynamique spatiale de la végétation."
        },
        {
            id: "day120",
            label: "J+120",
            date: "4 mois après l’ignition",
            image: "img/wildfire/120J.png",
            caption:
                "Quatre mois après le feu, la séquence permet d’observer l’évolution plus longue du signal de végétation. Dans le projet, ce type de raster est résumé en variables temporelles et spatiales utilisables par le pipeline de modélisation."
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const active = frames[activeIndex];

    return (
        <div className="ndvi-timeline">
            <div className="ndvi-timeline-intro">
                <div className="method-note">
                    <strong>Pourquoi le NDVI est utile :</strong> le NDVI est un indicateur issu
                    de l’imagerie satellite qui sert à approximer l’état de la végétation. Dans ce
                    projet, il aide à décrire le contexte végétal autour d’un feu avant d’être
                    transformé en variables utilisables par le modèle.
                </div>
            </div>

            <div className="ndvi-week-tabs">
                {frames.map((frame, index) => (
                    <button
                        key={frame.id}
                        className={activeIndex === index ? "ndvi-week-tab active" : "ndvi-week-tab"}
                        onClick={() => {
                            setActiveIndex(index);
                            setIsZoomOpen(false);
                        }}
                    >
                        <span>{frame.label}</span>
                        <strong>{frame.date}</strong>
                    </button>
                ))}
            </div>

            <div className="ndvi-viewer-card">
                <div className="ndvi-image-wrap">
                    <button
                        className="ndvi-image-button"
                        onClick={() => setIsZoomOpen(true)}
                        aria-label="Agrandir l’image NDVI"
                    >
                        <img
                            src={active.image}
                            alt={active.label}
                            onError={(event) => {
                                console.error("Image introuvable :", active.image);
                            }}
                        />
                    </button>
                </div>

                <div className="ndvi-text-wrap">
                    <span className="script-badge">Raster NDVI</span>
                    <h3>{active.label}</h3>
                    <p><strong>Période :</strong> {active.date}</p>
                    <p>{active.caption}</p>

                    <div className="method-note">
                        <strong>Note :</strong> cette séquence est utilisée ici comme explication
                        visuelle du NDVI. Le modèle prédictif privilégie les informations disponibles
                        avant ou au moment de l’ignition afin d’éviter la fuite temporelle.
                    </div>
                </div>
            </div>

            {isZoomOpen && (
                <div
                    className="image-modal"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <button
                        className="image-modal-close"
                        onClick={() => setIsZoomOpen(false)}
                        aria-label="Fermer l’image agrandie"
                    >
                        ×
                    </button>

                    <img
                        src={active.image}
                        alt={active.label}
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}


function RawDataExplorer() {
    const sources = [
        {
            id: "ndvi",
            title: "NDVI",
            subtitle: "Végétation et combustible",
            icon: "🌲",
            badge: "Raster satellite",
            description:
                "Le NDVI est un indicateur dérivé de l’imagerie satellite. Dans ce projet, il sert à représenter l’état de la végétation autour du feu et à construire des variables spatiales et temporelles.",
            format: "Rasters annuels avec bandes temporelles.",
            role:
                "Décrire le contexte végétal autour du point d’ignition.",
            examples: [
                "NDVI moyen autour du feu",
                "NDVI minimum et maximum",
                "Fraction de pixels valides",
                "Échelles de 2 km, 5 km, 10 km et 25 km"
            ],
            visual: "ndvi"
        },
        {
            id: "era5",
            title: "ERA5",
            subtitle: "Météo pré-feu",
            icon: "🌦️",
            badge: "NetCDF météo",
            description:
                "ERA5 fournit les conditions météo quotidiennes autour de chaque feu. Ces données permettent de représenter la chaleur, le vent, la pluie, la neige et la sécheresse de l’air avant l’ignition.",
            format: "Fichiers NetCDF mensuels par variable météo.",
            role:
                "Décrire les conditions atmosphériques précédant le départ du feu.",
            examples: [
                "Température moyenne, minimale et maximale",
                "Précipitations cumulées",
                "Vitesse du vent",
                "Déficit de pression de vapeur",
                "Présence ou absence de neige"
            ],
            visual: "era5"
        },
        {
            id: "fwi",
            title: "Indices FWI",
            subtitle: "Danger incendie",
            icon: "🔥",
            badge: "Indices quotidiens",
            description:
                "Les indices FWI résument le niveau de danger d’incendie à partir des conditions météo. Ils donnent une indication de l’humidité du combustible, du potentiel de propagation et de l’intensité potentielle du feu.",
            format: "Grilles quotidiennes FFMC, ISI, BUI et FWI.",
            role:
                "Représenter le contexte de danger incendie avant l’ignition.",
            examples: [
                "FFMC : humidité des combustibles fins",
                "ISI : potentiel de propagation initiale",
                "BUI : combustible disponible",
                "FWI : danger global d’incendie",
                "Jours au-dessus de seuils de danger"
            ],
            visual: "fwi"
        },
        {
            id: "fires",
            title: "Polygones de feux",
            subtitle: "Base centrale",
            icon: "🔥",
            badge: "Shapefile / géométrie",
            description:
                "Les feux historiques constituent la base centrale du projet. Chaque feu est associé à une date de référence, une taille finale, une géométrie et un identifiant unique utilisé dans toutes les jointures.",
            format: "Shapefiles historiques 1972–2020 et 2021–2024.",
            role:
                "Définir les observations du modèle : une ligne correspond à un feu.",
            examples: [
                "Identifiant fire_uid",
                "Date de départ t0",
                "Taille finale SIZE_HA",
                "Point ou géométrie du feu",
                "Agence et année du feu"
            ],
            visual: "fires"
        },
        {
            id: "dem",
            title: "DEM",
            subtitle: "Topographie",
            icon: "⛰️",
            badge: "Raster d’élévation",
            description:
                "Le DEM décrit le relief autour du feu. Il permet de calculer des variables comme l’altitude, la pente, la rugosité et les contrastes topographiques dans différents buffers.",
            format: "Raster numérique d’élévation.",
            role:
                "Décrire le contexte physique du terrain autour du feu.",
            examples: [
                "Altitude moyenne",
                "Variation du relief",
                "Pente locale",
                "Rugosité du terrain",
                "Contrastes entre petits et grands buffers"
            ],
            visual: "dem"
        },
        {
            id: "roads",
            title: "Routes",
            subtitle: "Accessibilité",
            icon: "🛣️",
            badge: "Données vectorielles",
            description:
                "Les routes servent à approximer l’accessibilité du feu. Un feu éloigné des infrastructures peut être plus difficile à atteindre rapidement.",
            format: "Réseau routier vectoriel.",
            role:
                "Décrire l’isolement ou l’accessibilité autour du feu.",
            examples: [
                "Distance à la route la plus proche",
                "Densité de routes dans un buffer",
                "Score d’isolement",
                "Variables d’accessibilité à 5 km, 10 km et 25 km"
            ],
            visual: "roads"
        },
        {
            id: "landcover",
            title: "Occupation du sol",
            subtitle: "Contexte environnemental",
            icon: "🗺️",
            badge: "Raster landcover",
            description:
                "L’occupation du sol indique le type de surface autour du feu : forêt, eau, roche, zones non brûlables ou autres classes. Ces informations aident à contextualiser le combustible potentiel.",
            format: "Raster de classes d’occupation du sol.",
            role:
                "Décrire le type d’environnement autour du feu.",
            examples: [
                "Fraction de forêt",
                "Fraction d’eau",
                "Fraction non brûlable",
                "Classes dominantes dans les buffers",
                "Contexte spatial du point d’ignition"
            ],
            visual: "landcover"
        },
        {
            id: "scanfi",
            title: "SCANFI",
            subtitle: "Contexte statique",
            icon: "🧱",
            badge: "Raster statique",
            description:
                "SCANFI est utilisé comme source statique pour décrire certaines classes de surface, notamment l’eau, la roche et les zones potentiellement non brûlables.",
            format: "Raster de classes statiques.",
            role:
                "Ajouter un contexte approximatif sur les zones brûlables et non brûlables.",
            examples: [
                "Fraction d’eau",
                "Fraction de roche",
                "Fraction non brûlable",
                "Proxy de surface brûlable",
                "Variables statiques par buffer"
            ],
            visual: "scanfi"
        },
        {
            id: "history",
            title: "Historique des feux",
            subtitle: "Mémoire spatiale",
            icon: "🕒",
            badge: "Table géospatiale",
            description:
                "L’historique local des feux permet de représenter la mémoire spatiale du territoire. Le pipeline regarde les feux passés autour du feu courant, sans utiliser d’information future.",
            format: "Table de feux historiques avec dates et coordonnées.",
            role:
                "Décrire l’activité passée des feux autour du point d’ignition.",
            examples: [
                "Nombre de feux voisins",
                "Nombre de gros feux passés",
                "Temps depuis le dernier feu proche",
                "Taille moyenne ou maximale des feux passés",
                "Fenêtres historiques de 3 ans, 5 ans et 5 à 10 ans"
            ],
            visual: "history"
        }
    ];

    const [activeId, setActiveId] = useState("ndvi");
    const active = sources.find((source) => source.id === activeId);

    return (
        <div className="raw-data-explorer">
            <div className="raw-data-layout">
                <div className="raw-data-tabs">
                    {sources.map((source) => (
                        <button
                            key={source.id}
                            className={
                                activeId === source.id
                                    ? "raw-data-tab active"
                                    : "raw-data-tab"
                            }
                            onClick={() => setActiveId(source.id)}
                        >
                            <span className="raw-data-icon">{source.icon}</span>

                            <span>
                                <strong>{source.title}</strong>
                                <small>{source.subtitle}</small>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="raw-data-panel">
                    <div className="raw-data-header">
                        <span className="script-badge">{active.badge}</span>
                        <h3>{active.icon} {active.title}</h3>
                        <p>{active.description}</p>
                    </div>

                    <RawDataVisual type={active.visual} />

                    <div className="raw-data-info-grid">
                        <div>
                            <h4>Format brut</h4>
                            <p>{active.format}</p>
                        </div>

                        <div>
                            <h4>Rôle dans le projet</h4>
                            <p>{active.role}</p>
                        </div>
                    </div>

                    <div className="raw-data-extract-box">
                        <h4>Ce que le pipeline en extrait</h4>

                        <ul>
                            {active.examples.map((example, index) => (
                                <li key={index}>{example}</li>
                            ))}
                        </ul>
                    </div>

                    {active.id === "ndvi" && (
                        <div className="raw-data-ndvi-section ndvi-inside-raw">
                            <h4>Comprendre le NDVI</h4>

                            <p>
                                Les images ci-dessous montrent l’évolution du signal NDVI autour d’un
                                grand feu au fil du temps. Cette visualisation sert à expliquer le type
                                de raster utilisé par le pipeline avant sa transformation en variables
                                de modèle.
                            </p>

                            <NdviTimeline />
                        </div>
                    )}

                    {active.id !== "ndvi" && (
                        <div className="method-note">
                            <strong>Pourquoi c’est utile :</strong> cette source ajoute un contexte
                            complémentaire au point d’ignition. Le pipeline transforme ensuite ces
                            données brutes en variables numériques alignées avec chaque <code>fire_uid</code>.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


function RawDataVisual({ type }) {
    if (type === "era5") {
        return (
            <div className="raw-data-visual-card">
                <div className="era5-visual">
                    <div className="era5-grid">
                        <span>🌡️ Température</span>
                        <span>🌧️ Précipitations</span>
                        <span>💨 Vent</span>
                        <span>❄️ Neige</span>
                    </div>

                    <div className="raw-data-arrow">↓</div>

                    <div className="era5-output">
                        Fenêtres pré-feu
                        <small>pre3 · pre7 · pre14 · pre30</small>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "fwi") {
        return (
            <div className="raw-data-visual-card">
                <div className="raw-fwi-visual">
                    <div className="raw-fwi-box">
                        FFMC
                        <small>combustibles fins</small>
                    </div>

                    <div className="raw-fwi-box">
                        ISI
                        <small>propagation</small>
                    </div>

                    <div className="raw-fwi-box">
                        BUI
                        <small>combustible disponible</small>
                    </div>

                    <div className="raw-fwi-box main">
                        FWI
                        <small>danger global</small>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "fires") {
        return (
            <div className="raw-data-visual-card">
                <div className="fire-polygon-visual">
                    <div className="fire-poly poly-a">Feu A</div>
                    <div className="fire-poly poly-b">Feu B</div>
                    <div className="fire-poly poly-c">Feu C</div>
                    <div className="fire-point">t0</div>
                </div>
            </div>
        );
    }

    if (type === "dem") {
        return (
            <div className="raw-data-visual-card">
                <div className="dem-visual">
                    <div className="dem-layer high">Haute altitude</div>
                    <div className="dem-layer mid">Pente / relief</div>
                    <div className="dem-layer low">Basse altitude</div>
                    <div className="dem-output">Altitude · pente · rugosité</div>
                </div>
            </div>
        );
    }

    if (type === "roads") {
        return (
            <div className="raw-data-visual-card">
                <div className="raw-roads-visual">
                    <div className="road-line main-road"></div>
                    <div className="road-line secondary-road"></div>
                    <div className="road-line small-road"></div>

                    <div className="road-fire-point">🔥</div>

                    <div className="road-distance-label">
                        Distance à la route
                    </div>
                </div>
            </div>
        );
    }

    if (type === "landcover") {
        return (
            <div className="raw-data-visual-card">
                <div className="raw-landcover-visual">
                    <div className="landcover-cell forest">Forêt</div>
                    <div className="landcover-cell water">Eau</div>
                    <div className="landcover-cell rock">Roche</div>
                    <div className="landcover-cell burnable">Végétation</div>
                    <div className="landcover-cell nonburnable">Non brûlable</div>
                    <div className="landcover-cell forest">Forêt</div>
                </div>
            </div>
        );
    }

    if (type === "scanfi") {
        return (
            <div className="raw-data-visual-card">
                <div className="raw-scanfi-visual">
                    <div className="scanfi-chip water">Eau</div>
                    <div className="scanfi-chip rock">Roche</div>
                    <div className="scanfi-chip nonburnable">Non brûlable</div>

                    <div className="raw-data-arrow">↓</div>

                    <div className="scanfi-output">
                        Fractions par buffer
                        <small>2 km · 5 km · 10 km · 25 km</small>
                    </div>
                </div>
            </div>
        );
    }

    if (type === "history") {
        return (
            <div className="raw-data-visual-card">
                <div className="raw-history-visual">
                    <div className="history-current-fire">Feu courant</div>
                    <div className="history-ring">rayon local</div>

                    <div className="history-old-fire hf-a">-2 ans</div>
                    <div className="history-old-fire hf-b">-5 ans</div>
                    <div className="history-old-fire hf-c">gros feu passé</div>
                </div>
            </div>
        );
    }

    return (
        <div className="raw-data-visual-card">
            <div className="raw-ndvi-visual">
                <div className="raw-ndvi-pixel strong"></div>
                <div className="raw-ndvi-pixel medium"></div>
                <div className="raw-ndvi-pixel weak"></div>
                <div className="raw-ndvi-pixel medium"></div>
                <div className="raw-ndvi-pixel weak"></div>
                <div className="raw-ndvi-pixel strong"></div>
                <div className="raw-ndvi-pixel medium"></div>
                <div className="raw-ndvi-pixel weak"></div>
                <div className="raw-ndvi-pixel strong"></div>
            </div>
        </div>
    );
}

const rawDataRoot = document.getElementById("react-wildfire-raw-data");

if (rawDataRoot) {
    ReactDOM.createRoot(rawDataRoot).render(<RawDataExplorer />);
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