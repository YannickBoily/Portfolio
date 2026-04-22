const { useState, useEffect } = React;

function Project(props) {
    return (
        <div className="project">
            <h3>{props.title}</h3>
            <p>{props.shortDescription}</p>
            <button onClick={() => props.onOpen(props)} className="btn-open">
                Voir détails
            </button>
        </div>
    );
}

const descriptionsCours = {
    "Laboratoire en statistique (STT 3781)": "Analyse de données réelles, rédaction de rapports statistiques et utilisation avancée de logiciels spécialisés. [cite: 2]",
    "Projets en apprentissage automatique (IFT3710)": "Réalisation d'un projet complet de ML, de la conception à l'implémentation et l'évaluation des performances. [cite: 2]",
    "Modélisation Mathématique (MAT3450)": "Application des outils mathématiques pour résoudre des problèmes concrets issus de divers domaines. [cite: 1]",
    // Ajoute les autres descriptions ici sur le même modèle
};

function Formation() {
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [coursDescriptions, setCoursDescriptions] = useState({});

  // ✅ Charge cours.json (même dossier que index.html sur GitHub Pages)
  useEffect(() => {
    fetch("./cours.json")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger cours.json");
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
      domaine: "Mathématiques",
      icon: "∑",
      cours: [
        "Analyse (MAT1000)",
        "Calcul (MAT1400)",
        "Algèbre linéaire (MAT1600)",
        "Probabilité (MAT1720)",
        "Analyse numérique (MAT2412)",
        "Processus stochastique (MAT2717)",
        "Modélisation Mathématique (MAT3450)",
      ],
    },
    {
      domaine: "Statistique",
      icon: "📊",
      cours: [
        "Introduction à la statistique (STT1700)",
        "Régression linéaire(STT2400)",
        "Concept et méthode en statistique(STT2700)",
        "Plan d'analyse et d'experience (STT3410)",
        "Laboratoire en statistique (STT 3781)",
        "Apprentissage statistique (STT3790)",
        "Fondement théorique en science des données(STT3795)",
      ],
    },
    {
      domaine: "Informatique",
      icon: "💻",
      cours: [
        "Design et développement web (IFT1005)",
        "Programmation 1 (IFT1015)",
        "Programmation 2 (IFT1025)",
        "Structure discrète en informatique (IFT1065)",
        "Introduction aux systèmes informatiques (IFT1215)",
        "Modèle de recherche opérationnelle (IFT1575)",
        "Structure de données (IFT2015)",
        "Introduction à l'informatique théorique (IFT2105)",
        "Introduction à l'algorithmique (IFT2125)",
        "Genie logiciel (IFT2255)",
        "Interfaces personne-machine (IFT 2905)",
        "Technologie de l'Internet (IFT 3225)",
        "Introduction à la science des données (IFT3700)",
        "Projets en apprentissage automatique (IFT3710)",
      ],
    },
  ];

  // 🔎 Extrait le code dans (...) et normalise les espaces : "STT 3781" -> "STT3781"
  const extractCourseCode = (nomCours) => {
    const match = nomCours.match(/\(([^)]+)\)/);
    if (!match) return null;
    return match[1].replace(/\s+/g, "");
  };

  // 🔗 Construit l'URL UdeM: MAT1000 -> .../mat-1000/
  const codeToUdeMUrl = (code) => {
    if (!code) return null;
    const m = String(code).match(/^([A-Za-z]+)(\d+)$/);
    if (!m) return null;
    const sigle = m[1].toLowerCase();
    const num = m[2];
    return `https://admission.umontreal.ca/cours-et-horaires/cours/${sigle}-${num}/`;
  };

  const showDesc = (nomCours) => {
    const code = extractCourseCode(nomCours);
    const desc =
      (code && coursDescriptions[code]) || "Description à venir pour ce cours.";
    const url = codeToUdeMUrl(code);

    setSelectedDescription({ titre: nomCours, texte: desc, url });
  };

  return (
    <div className="formation-grid">
      {cursus.map((item, idx) => (
        <div key={idx} className="formation-card">
          <div className="formation-header">
            <span className="formation-icon">{item.icon}</span>
            <h3>{item.domaine}</h3>
          </div>

          <ul>
            {item.cours.map((c, i) => (
              <li
                key={i}
                onClick={() => showDesc(c)}
                className="clickable-course"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      ))}

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
            shortDescription: "Modélisation du risque de feux extrêmes à partir de données météo, topographiques et spatiales avec un système de fusion de modèles.",
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
            title: "Projet détection de tremblements de terre",
            shortDescription: "Détection automatique de séismes à partir de signaux sismiques.",
            description: `Ce projet porte sur la détection de séismes à partir de signaux sismiques et de métadonnées associées.

            Nous avons utilisé le dataset INSTANCE, composé de signaux sismiques multicanaux et de variables descriptives (localisation, caractéristiques des stations, propriétés du signal).

            L’objectif initial était la prédiction des séismes, mais l’analyse des données a montré que les signaux avant l’événement contiennent principalement du bruit. Nous avons donc reformulé le problème en tâche de détection : distinguer un séisme d’un bruit sismique.

            Plusieurs approches ont été développées et comparées :
            - des modèles CNN pour analyser les signaux bruts
            - un modèle inspiré de EQTransformer combinant convolutions, RNN et attention pour détecter les événements et leurs phases (P et S)
            - un modèle tabulaire (Random Forest) utilisant uniquement les métadonnées

            Les résultats montrent qu’il est possible d’atteindre des performances proches de l’état de l’art avec des ressources limitées, notamment avec un F1-score supérieur à 0.98 pour les modèles basés sur les signaux.

            Ce projet met en évidence l’efficacité du deep learning pour l’analyse de signaux complexes ainsi que l’intérêt de combiner différentes sources d’information.`,
            images: [
                { src: "img/eq1.webp", caption: "Architecture du modèle" },
                { src: "img/eq2.webp", caption: "Résultats de détection" },
                { src: "img/eq3.webp", caption: "Courbes de performance" }
            ],
            link: "https://github.com/damoursm/earthquake"
        },
        {
            title: "Classification santé fœtale (CTG)",
            shortDescription: "Classification de l’état de santé fœtale (Normal/Suspect/Pathologique) à partir de données cardiotocographiques (CTG) en comparant plusieurs modèles (Random Forest, SVM, Bayes naïf) et un ensemble par vote.",
            description: "Objectif : prédire l’état de santé fœtale (Normal/Suspect/Pathologique) à partir de variables extraites d’enregistrements CTG (n≈2 126). J’ai comparé plusieurs modèles (Random Forest, SVM RBF, Bayes naïf), évalué les performances avec matrices de confusion et métriques par classe (déséquilibre des classes), puis construit un ensemble (vote) pour améliorer la robustesse. Résultat : accuracy ~96% avec l’ensemble.",
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
