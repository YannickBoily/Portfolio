const { useState } = React;

function Project(props) {
    return (
        <div className="project">
            <h3>{props.title}</h3>
            <p>{props.shortDescription}</p>
            <button onClick={() => props.onOpen(props)} className="btn-open">
                +
            </button>
        </div>
    );
}

function Formation() {
    const cursus = [
        {
            domaine: "Mathématiques",
            icon: "∑",
            cours: [
                "Analyse (MAT1000)", "Calcul (MAT1400)", "Algèbre linéaire (MAT1600)", 
                "Probabilité (MAT1720)", "Analyse numérique (MAT2412)", 
                "Processus stochastique (MAT2717)", "Modélisation Mathématique (MAT3450)"
            ]
        },
        {
            domaine: "Statistique",
            icon: "📊",
            cours: [
                "Introduction à la statistique (STT1700)", "Régression linéaire (STT2400)", 
                "Concept et méthode en statistique (STT2700)", "Plan d'analyse et d'expérience (STT3410)", 
                "Laboratoire en statistique (STT3781) - EN COURS", "Apprentissage statistique (STT3790)", 
                "Fondement théorique en science des données (STT3795)"
            ]
        },
        {
            domaine: "Informatique",
            icon: "💻",
            cours: [
                "Design et développement web (IFT1005)", "Programmation 1 & 2 (IFT1015/1025)", 
                "Structure discrète (IFT1065)", "Systèmes informatiques (IFT1215)", 
                "Recherche opérationnelle (IFT1575)", "Structure de données (IFT2015)", 
                "Informatique théorique (IFT2105)", "Algorithmique (IFT2125)", 
                "Génie logiciel (IFT2255)", "Interfaces personne-machine (IFT2905)", 
                "Technologie de l'Internet (IFT3225)", "Science des données (IFT3700)", 
                "Projets en apprentissage automatique (IFT3710)"
            ]
        },
        {
            domaine: "Économie",
            icon: "📈",
            cours: ["Introduction à la macroéconomie (ECN1050)"]
        }
    ];

    return (
        <div className="formation-grid">
            {cursus.map((item, idx) => (
                <div key={idx} className="formation-card">
                    <div className="formation-header">
                        <span className="formation-icon">{item.icon}</span>
                        <h3>{item.domaine}</h3>
                    </div>
                    <ul>
                        {item.cours.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                </div>
            ))}
        </div>
    );
}
function Projects() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    const projectList = [
        {
            title: "Projet feux de forêts",
            shortDescription: "Analyse de l’impact des changements climatiques sur les feux de forêts au Canada.",
            description: "Ce projet consistait à modéliser l'effet des changements climatiques sur les feux de forêts au Canada...",
            images: [
                { src: "img/testimage.webp", caption: "Carte principale des feux de forêts" },
                { src: "img/testimage2.webp", caption: "Variables climatiques utilisées" }
            ],
            link: "https://github.com/YannickBoily/Projet-Feux-forest"
        },
        {
            title: "Projet détection de tremblements de terre",
            shortDescription: "Détection automatique de séismes à partir de signaux sismiques.",
            description: "Projet de deep learning inspiré d’EQTransformer...",
            images: [
                { src: "img/eq1.webp", caption: "Architecture du modèle" },
                { src: "img/eq2.webp", caption: "Résultats de détection" },
                { src: "img/eq3.webp", caption: "Courbes de performance" }
            ],
            link: "https://github.com/damoursm/earthquake"
        }
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
ReactDOM.createRoot(document.getElementById("react-formation")).render(<Formation />);