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

    const projectList = [
        {
            title: "Projet feux de forêts",
            shortDescription: "Analyse de l’impact des changements climatiques sur les feux de forêts au Canada.",
            tech: "Données climatiques • SIG • Analyse spatiale",
            metrics: "Analyse spatio-temporelle",
            description: "Ce projet consistait à modéliser l'effet des changements climatiques sur les feux de forêts au Canada. Les données utilisées provenaient de l’ECMWF (données météorologiques quotidiennes sur grille latitude/longitude 0.1°), du CNFDB (polygones de feux), ainsi que de données géographiques et topographiques.",
            images: [
            {
                src: "/img/testimage.webp",
                caption: "Carte des feux de forêts et variables climatiques utilisées dans l’analyse"
            }
            ],
            link: "https://github.com/YannickBoily/Projet-Feux-forest"
        }
,
        {
            title: "Projet détection de tremblements de terre",
            shortDescription: "Détection automatique de séismes à partir de signaux sismiques à l’aide de CNN et Transformers.",
            description: "Projet de machine learning et deep learning visant à détecter automatiquement des tremblements de terre à partir de signaux sismiques. À partir du jeu de données INSTANCE (plus d’un million de signaux multicanaux), nous avons développé plusieurs modèles : un Random Forest basé sur des métadonnées sismiques, deux réseaux de neurones convolutionnels (CNN) pour la classification séisme/bruit, et un modèle avancé inspiré d’EQTransformer (architecture encoder–decoder avec CNN, RNN et Transformers) permettant la détection des séismes et le phase picking (ondes P et S). Les modèles atteignent jusqu’à 98 % de F1-score tout en utilisant des ressources computationnelles limitées. Projet réalisé en Python avec TensorFlow, scikit-learn et MLflow.",
            link: "https://github.com/damoursm/earthquake"
        },
        {
            title: "Projet 3",
            shortDescription: "a completer",
            description: "projet stt3795 peut etre a voir",
            link: "https://github.com/damoursm/earthquake"
        },
        {
            title: "Projet 4",
            shortDescription: "a completer",
            description: "projet stt3781 peut etre a voir ou faire celui de stt3700 qu'on a pas fait finalement",
            link: "https://github.com/damoursm/earthquake"
        }
    ];

    return (
        <div>
            <div className="projects-grid">
                {projectList.map((proj, index) => (
                    <Project 
                        key={index} 
                        {...proj} 
                        onOpen={setSelectedProject} 
                    />
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
        </div>
    );
}

ReactDOM.createRoot(
    document.getElementById("react-projects")
).render(<Projects />);

