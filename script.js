function Project({ title, description, link }) {
    return (
        <div className="project">
            <h3>{title}</h3>
            <p>{description}</p>
            <a href={link} target="_blank">Voir le projet</a>
        </div>
    );
}

function Projects() {
    return (
        <>
            <Project
                title="Projet 1"
                description="Description du projet 1."
                link="#"
            />
            <Project
                title="Projet 2"
                description="Description du projet 2."
                link="#"
            />
        </>
    );
}

ReactDOM
    .createRoot(document.getElementById("react-projects"))
    .render(<Projects />);
