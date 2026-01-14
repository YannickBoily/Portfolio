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

ReactDOM.createRoot(
    document.getElementById("react-projects")
).render(<Projects />);
