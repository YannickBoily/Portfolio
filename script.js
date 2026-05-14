const { useState, useEffect } = React;

function Project(props) {
    return (
        <div className="project-card">
            <div className="project-card-header">
                <span className="project-category">{props.category}</span>
                <h3>{props.title}</h3>
            </div>

            <p className="project-description">
                {props.shortDescription}
            </p>

            {props.result && (
                <p className="project-result">
                    <strong>Résultat :</strong> {props.result}
                </p>
            )}

            {props.tech && (
                <div className="project-tech">
                    {props.tech.map((tool, index) => (
                        <span key={index}>{tool}</span>
                    ))}
                </div>
            )}

            <div className="project-actions">
                <button onClick={() => props.onOpen(props)} className="btn-open">
                    Voir détails
                </button>

                {props.link && (
                    <a
                        href={props.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-link-small"
                    >
                        GitHub
                    </a>
                )}

                {props.pdf && (
                    <a
                        href={props.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-link-small"
                    >
                        Rapport
                    </a>
                )}
            </div>
        </div>
    );
}

function Formation() {
    const [selectedDescription, setSelectedDescription] = useState(null);
    const [coursDescriptions, setCoursDescriptions] = useState({});

    useEffect(() => {
        fetch("./cours.json")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Impossible de charger cours.json");
                }

                return res.json();
            })
            .then((data) => setCoursDescriptions(data))
            .catch((err) => {
                console.error(err);
                setCoursDescriptions({});
            });
    }, []);

    const cursus = [
        {
            ecole: "udem",
            domaine: "Mathématiques",
            icon: "∑",
            cours: [
                "Analyse (MAT1000)",
                "Introduction à la macroéconomie (ECN1050)",
                "Calcul (MAT1400)",
                "Algèbre linéaire (MAT1600)",
                "Probabilité (MAT1720)",
                "Analyse numérique (MAT2412)",
                "Processus stochastique (MAT2717)",
                "Modélisation mathématique (MAT3450)",
                
            ],
        },
        {
            ecole: "udem",
            domaine: "Statistique",
            icon: "📊",
            cours: [
                "Introduction à la statistique (STT1700)",
                "Régression linéaire (STT2400)",
                "Concepts et méthodes en statistique (STT2700)",
                "Plan d’analyse et d’expérience (STT3410)",
                "Laboratoire en statistique (STT3781)",
                "Apprentissage statistique (STT3790)",
                "Fondements théoriques en science des données (STT3795)",
            ],
        },
        {
            ecole: "udem",
            domaine: "Informatique",
            icon: "💻",
            cours: [
                "Design et développement web (IFT1005)",
                "Programmation 1 (IFT1015)",
                "Programmation 2 (IFT1025)",
                "Structures discrètes en informatique (IFT1065)",
                "Introduction aux systèmes informatiques (IFT1215)",
                "Modèles de recherche opérationnelle (IFT1575)",
                "Structures de données (IFT2015)",
                "Introduction à l’informatique théorique (IFT2105)",
                "Introduction à l’algorithmique (IFT2125)",
                "Génie logiciel (IFT2255)",
                "Interfaces personne-machine (IFT2905)",
                "Technologie de l’Internet (IFT3225)",
                "Introduction à la science des données (IFT3700)",
                "Projet en apprentissage automatique (IFT3710)",
            ],
        },
        {
            ecole: "hec",
            domaine: "Exploitation et valorisation des données",
            icon: "📈",
            cours: [
                "Introduction à l’analytique d’affaires (MATH 30650)",
                "Statistique (MATH 30600)",
                "Introduction à l’apprentissage automatique (MATH 30636)",
            ],
        },
    ];

    const liensCours = {
        MATH30650: "https://www.hec.ca/cours/introduction-lanalytique-daffaires-0",
        MATH30600: "https://www.hec.ca/cours/statistique-0",
        MATH30636: "https://www.hec.ca/cours/introduction-lapprentissage-automatique",
    };

    const extractCourseCode = (nomCours) => {
        const match = nomCours.match(/\(([^)]+)\)/);

        if (!match) {
            return null;
        }

        return match[1].replace(/\s+/g, "");
    };

    const codeToCourseUrl = (code) => {
        if (!code) {
            return null;
        }

        const normalizedCode = String(code).replace(/\s+/g, "");

        if (liensCours[normalizedCode]) {
            return liensCours[normalizedCode];
        }

        if (/^(MAT|STT|IFT)\d+$/i.test(normalizedCode)) {
            const m = normalizedCode.match(/^([A-Za-z]+)(\d+)$/);
            const sigle = m[1].toLowerCase();
            const num = m[2];

            return `https://admission.umontreal.ca/cours-et-horaires/cours/${sigle}-${num}/`;
        }

        return null;
    };

    const showDesc = (nomCours) => {
        const code = extractCourseCode(nomCours);
        const desc =
            (code && coursDescriptions[code]) ||
            "Description à venir pour ce cours.";
        const url = codeToCourseUrl(code);

        setSelectedDescription({
            titre: nomCours,
            texte: desc,
            url,
        });
    };

    const cursusUdem = cursus.filter((item) => item.ecole === "udem");
    const cursusHec = cursus.filter((item) => item.ecole === "hec");

    return (
        <div>
            <div className="formation-school">
                <h3>Université de Montréal</h3>

                <p className="formation-program">
                    Baccalauréat en mathématiques et informatique — cheminement science des données
                </p>

                <div className="formation-grid">
                    {cursusUdem.map((item, idx) => (
                        <div key={idx} className="formation-card">
                            <div className="formation-header">
                                <span className="formation-icon">{item.icon}</span>
                                <h3>{item.domaine}</h3>
                            </div>

                            <ul>
                                {item.cours.map((cours, i) => (
                                    <li
                                        key={i}
                                        onClick={() => showDesc(cours)}
                                        className="clickable-course"
                                    >
                                        {cours}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="formation-school">
                <h3>HEC Montréal</h3>

                <p className="formation-program">
                    Certificat en exploitation et valorisation des données — en cours
                </p>

                <div className="formation-grid formation-grid-hec">
                    {cursusHec.map((item, idx) => (
                        <div
                            key={idx}
                            className="formation-card formation-card-hec"
                        >
                            <div className="formation-header">
                                <span className="formation-icon">{item.icon}</span>
                                <h3>{item.domaine}</h3>
                            </div>

                            <ul>
                                {item.cours.map((cours, i) => (
                                    <li
                                        key={i}
                                        onClick={() => showDesc(cours)}
                                        className="clickable-course"
                                    >
                                        {cours}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDescription && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedDescription(null)}
                >
                    <div
                        className="modal-content modal-small"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span
                            className="close-button"
                            onClick={() => setSelectedDescription(null)}
                        >
                            &times;
                        </span>

                        <h3>
                            {selectedDescription.url ? (
                                <a
                                    href={selectedDescription.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="course-link"
                                >
                                    {selectedDescription.titre}
                                </a>
                            ) : (
                                selectedDescription.titre
                            )}
                        </h3>

                        <p>{selectedDescription.texte}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Rendu final
ReactDOM.createRoot(document.getElementById("react-formation")).render(<Formation />);
function Projects() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const projectList = [
        {
            title: "Projet prédictions de la tailles des feux de forêts",
            category: "Machine Learning · Données géospatiales",
            shortDescription: "Modélisation du risque de feux extrêmes à partir de données météo, topographiques et spatiales avec un système de fusion de modèles.",
            tech: ["Python", "XGBoost", "Pandas", "Données spatiales"],
            result: "Pipeline optimisé pour mieux détecter les feux critiques",
            description: `Ce projet vise à prédire la taille des feux de forêt à partir de données environnementales dérivées de sources spatiales.

            Les variables sont extraites de données géospatiales puis transformées en features tabulaires pour l’entraînement du modèle.

            Pour gérer le fort déséquilibre des classes, j’ai développé un pipeline hybride avec XGBoost, combinant plusieurs étapes de décision pour mieux détecter les feux extrêmes.

            Le pipeline est optimisé de bout en bout, y compris les seuils de décision, afin de maximiser la détection des feux critiques tout en limitant les erreurs graves.

            Le modèle obtient un rappel élevé sur les gros feux et reste stable sur plusieurs années de test.`,
            images: [
                { src: "img/projet1/1.png", caption: "Répartition des tailles de feux dans les données de test, montrant un fort déséquilibre" },
                { src: "img/projet1/2.png", caption: "Bonne détection des feux critiques, avec un compromis volontaire entre précision et rappel" },
                { src: "img/projet1/3.png", caption: "La majorité des erreurs sont proches de la bonne classe ; les erreurs graves restent limitées" }
            ],
            link: "https://github.com/YannickBoily/Projet-Feux-forest"
        },
        {
            title: "Détection de séismes par deep learning",
            category: "Deep Learning · Signaux temporels · Détection",
            shortDescription: "Détection automatique de séismes à partir de signaux sismiques multicanaux, en comparant des modèles CNN, Transformer et Random Forest sur métadonnées.",
            coverImage: "img/projet2/signal_prediction.png",
            coverAlt: "Signal sismique et prédiction du modèle",
            tech: ["Python", "Deep Learning", "CNN", "Transformer", "Random Forest", "MLflow"],
            result: "F1-score de 0,98 avec un modèle encoder/decoder inspiré d’EQTransformer",
            description: `Ce projet porte sur la détection automatique de séismes à partir de signaux sismiques et de métadonnées issues du dataset INSTANCE.

L’objectif initial était de prédire les séismes avant leur apparition, mais l’analyse des données a montré que les segments précédant l’événement contenaient principalement du bruit. Le problème a donc été reformulé en tâche de détection : distinguer les signaux de séismes des signaux de bruit et identifier les événements sismiques dans les séries temporelles.

Plusieurs approches ont été comparées : des modèles CNN inspirés de ConvNetQuake, un modèle encoder/decoder inspiré d’EQTransformer, ainsi qu’un modèle Random Forest basé sur les métadonnées. Le projet a aussi nécessité la manipulation d’un grand volume de données, avec des signaux multicanaux et des métadonnées associées aux stations et aux événements.

Le modèle principal a atteint un F1-score de 0,98, avec des performances comparables à des modèles de référence tout en utilisant beaucoup moins de données d’entraînement et des ressources de calcul plus modestes.

Ce projet m’a permis de travailler sur un problème avancé de deep learning appliqué aux séries temporelles, avec des enjeux de traitement de données massives, de comparaison de modèles et d’évaluation rigoureuse des performances.`,
            images: [
                
                { src: "img/projet2/signal_prediction.png", caption: "Signal sismique et prédiction du modèle" },
                { src: "img/projet2/Eq_model.png", caption: "Modèle d'apprentissage profond" },
                { src: "img/projet2/2.png", caption: "Résultats" },
                { src: "img/projet2/4.png", caption: "Courbe d'entraînement" },
            ],
            link: "https://github.com/damoursm/earthquake",
            pdf: "pdf/Earthquake-1.pdf"
        },
        {
            title: "Classification de la santé fœtale à partir de données médicales (CTG)",
            category: "Machine Learning · Données médicales · Classification",
            shortDescription: "Classification de l’état de santé fœtale à partir de données cardiotocographiques, en comparant plusieurs modèles supervisés et un modèle d’ensemble.",
            tech: ["Python", "Scikit-learn", "SVM", "Random Forest", "PCA", "Isomap"],
            result: "Précision de 95,86 % avec un modèle combinatoire",
            description: `Ce projet vise à classifier l’état de santé fœtale à partir de données cardiotocographiques, selon trois classes : normal, suspect et pathologique. Le jeu de données contient 2126 observations et 21 variables décrivant des mesures liées au rythme cardiaque fœtal, aux contractions utérines et à différents indicateurs statistiques issus des histogrammes. J’ai participé à l’analyse exploratoire des données ainsi qu’à l’implémentation de plusieurs modèles de classification, notamment les arbres de décision, les forêts aléatoires, la réduction de dimensionnalité par PCA et un modèle combinatoire basé sur un système de vote. Les modèles comparés incluent les SVM, les arbres de décision, les forêts aléatoires et Bayes naïf. Des méthodes de réduction de dimensionnalité comme PCA, MDS et Isomap ont aussi été utilisées pour analyser la structure des données et visualiser les prédictions. Le meilleur résultat a été obtenu avec un modèle combinatoire, atteignant une précision de 95,86 %. Ce projet m’a permis de travailler sur un problème de classification médicale avec des classes déséquilibrées, tout en mettant l’accent sur l’interprétation des résultats et la comparaison rigoureuse des modèles.`,
            images: [
  { src: "img/projet3/classes_count.png", caption: "Distribution des classes (Normal/Suspect/Pathologique)" },
  { src: "img/projet3/boxplots.png", caption: "Distribution des variables (boxplots)" },
  { src: "img/projet3/isomap_bayes.png", caption: "Projection Isomap 2D — visualisation des classes" },  
  { src: "img/projet3/ratio_variance_cumulatif_pca.png", caption: "PCA — variance expliquée cumulative" },
  { src: "img/projet3/hard_weighted_voting.png", caption: "Ensemble (vote) — rapport de classification et matrice de confusion" }


],
            link: "https://github.com/YannickBoily/Stt3795ProjetHiv24",
            pdf: "pdf/Stt3795ProjetHiv24-1.pdf"
        },
        ];

    const openProject = (project) => {
        setSelectedProject(project);
        setCurrentImageIndex(0);
        setIsZoomOpen(false);
    };

    return (
        <div>
            <div className="projects-grid">
                {projectList.map((proj, index) => (
                    <Project key={index} {...proj} onOpen={openProject} />
                ))}
            </div>

            {selectedProject && (
                <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={() => setSelectedProject(null)}>
                            &times;
                        </span>

                        <h2>{selectedProject.title}</h2>
                        <p>{selectedProject.description}</p>

                        {selectedProject.images && (
                            <div className="carousel">
                                <button
                                    className="carousel-btn"
                                    onClick={() =>
                                        setCurrentImageIndex(
                                            (currentImageIndex - 1 + selectedProject.images.length) %
                                            selectedProject.images.length
                                        )
                                    }
                                >
                                    ‹
                                </button>

                                <figure className="carousel-image">
                                    <img
                                        src={selectedProject.images[currentImageIndex].src}
                                        alt={selectedProject.images[currentImageIndex].caption}
                                        onClick={() => setIsZoomOpen(true)}
                                    />
                                    <figcaption>
                                        {selectedProject.images[currentImageIndex].caption}
                                    </figcaption>
                                </figure>

                                <button
                                    className="carousel-btn"
                                    onClick={() =>
                                        setCurrentImageIndex(
                                            (currentImageIndex + 1) %
                                            selectedProject.images.length
                                        )
                                    }
                                >
                                    ›
                                </button>
                            </div>
                        )}

                        <a
                            href={selectedProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-link"
                        >
                            Visiter le GitHub
                        </a>
                        {selectedProject.pdf && (
                        <a
                        href={selectedProject.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-link"
                        style={{ marginLeft: "10px" }}
                        >
                        Voir le rapport (PDF)
                        </a>
                        )}
                    </div>
                </div>
            )}

            {isZoomOpen && selectedProject && (
                <div className="zoom-overlay" onClick={() => setIsZoomOpen(false)}>
                    <span className="zoom-close">&times;</span>
                    <img
                        src={selectedProject.images[currentImageIndex].src}
                        alt="Zoom"
                        className="zoom-image"
                    />
                </div>
            )}
        </div>
    );
}
ReactDOM.createRoot(document.getElementById("react-projects")).render(<Projects />);
