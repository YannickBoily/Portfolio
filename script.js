const { useState, useEffect } = React;

function Project(props) {
    return (
        <div className="project-card">
            {props.coverImage && (
                <img
                    src={props.coverImage}
                    alt={props.coverAlt || props.title}
                    className="project-cover"
                />
            )}

            <div className="project-card-body">
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
                    <button
                        onClick={() => props.onOpen(props)}
                        className="btn-open"
                    >
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
    const [projectList, setProjectList] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isZoomOpen, setIsZoomOpen] = useState(false);

    useEffect(() => {
        fetch("./projects.json")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Impossible de charger projects.json");
                }

                return res.json();
            })
            .then((data) => setProjectList(data))
            .catch((err) => {
                console.error(err);
                setProjectList([]);
            });
    }, []);

    const openProject = (project) => {
        setSelectedProject(project);
        setCurrentImageIndex(0);
        setIsZoomOpen(false);
    };

    const closeProject = () => {
        setSelectedProject(null);
        setCurrentImageIndex(0);
        setIsZoomOpen(false);
    };

    const previousImage = () => {
        if (!selectedProject || !selectedProject.images) {
            return;
        }

        setCurrentImageIndex(
            (currentImageIndex - 1 + selectedProject.images.length) %
            selectedProject.images.length
        );
    };

    const nextImage = () => {
        if (!selectedProject || !selectedProject.images) {
            return;
        }

        setCurrentImageIndex(
            (currentImageIndex + 1) % selectedProject.images.length
        );
    };

    const currentImage =
        selectedProject &&
        selectedProject.images &&
        selectedProject.images[currentImageIndex];

    return (
        <div>
            <div className="projects-grid">
                {projectList.map((project, index) => (
                    <Project
                        key={index}
                        {...project}
                        onOpen={openProject}
                    />
                ))}
            </div>

            {selectedProject && (
                <div className="modal-overlay" onClick={closeProject}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="close-button" onClick={closeProject}>
                            &times;
                        </span>

                        <span className="project-category">
                            {selectedProject.category}
                        </span>

                        <h2>{selectedProject.title}</h2>

                        {selectedProject.tech && (
                            <div className="project-tech modal-tech">
                                {selectedProject.tech.map((tool, index) => (
                                    <span key={index}>{tool}</span>
                                ))}
                            </div>
                        )}

                        {selectedProject.result && (
                            <p className="project-result">
                                <strong>Résultat :</strong> {selectedProject.result}
                            </p>
                        )}

                        <p className="modal-project-description">
                            {selectedProject.description}
                        </p>

                        {selectedProject.images && selectedProject.images.length > 0 && (
                            <div className="carousel">
                                <button
                                    className="carousel-btn"
                                    onClick={previousImage}
                                    aria-label="Image précédente"
                                >
                                    ‹
                                </button>

                                <figure className="carousel-image">
                                    <img
                                        src={currentImage.src}
                                        alt={currentImage.caption}
                                        onClick={() => setIsZoomOpen(true)}
                                    />

                                    <figcaption>
                                        <strong>{currentImage.caption}</strong>

                                        {currentImage.detail && (
                                            <p className="carousel-detail">
                                                {currentImage.detail}
                                            </p>
                                        )}
                                    </figcaption>
                                </figure>

                                <button
                                    className="carousel-btn"
                                    onClick={nextImage}
                                    aria-label="Image suivante"
                                >
                                    ›
                                </button>
                            </div>
                        )}

                        <div className="modal-actions">
                            {selectedProject.link && (
                                <a
                                    href={selectedProject.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-link"
                                >
                                    Visiter le GitHub
                                </a>
                            )}

                            {selectedProject.pdf && (
                                <a
                                    href={selectedProject.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-link"
                                >
                                    Voir le rapport PDF
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isZoomOpen && currentImage && (
                <div
                    className="zoom-overlay"
                    onClick={() => setIsZoomOpen(false)}
                >
                    <span className="zoom-close">&times;</span>

                    <img
                        src={currentImage.src}
                        alt={currentImage.caption}
                        className="zoom-image"
                    />
                </div>
            )}
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("react-projects")).render(<Projects />);
