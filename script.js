const { useState } = React;

function Project(props) {
    return (
        <div className="project">
            <h3>{props.title}</h3>
            <p>{props.description.substring(0, 100)}...</p>
            {/* On change le lien par un bouton qui déclenche la fonction openModal */}
            <button onClick={() => props.onOpen(props)} className="btn-open">
                Voir le projet
            </button>
        </div>
    );
}

function Projects() {
    const [selectedProject, setSelectedProject] = useState(null);

    const projectList = [
        {
            title: "Projet feux de forêts",
            description: "Voici la description détaillée du projet 1. Vous pouvez y ajouter des détails techniques, les outils utilisés, etc.",
            link: "https://github.com/YannickBoily/Projet-Feux-forest"
        },
        {
            title: "Projet tremblement de terre",
            description: "Description complète du deuxième projet. Ce texte apparaîtra uniquement dans la fenêtre surgissante.",
            link: "#"
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

            {/* Fenêtre Modale */}
            {selectedProject && (
                <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={() => setSelectedProject(null)}>&times;</span>
                        <h2>{selectedProject.title}</h2>
                        <p>{selectedProject.description}</p>
                        <a href={selectedProject.link} target="_blank" className="btn-link">Visiter le github</a>
                    </div>
                </div>
            )}
        </div>
    );
}

ReactDOM.createRoot(
    document.getElementById("react-projects")
).render(<Projects />);
