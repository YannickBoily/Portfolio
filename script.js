function Project(props) {
    return (
        <div className="project">
            <h3>{props.title}</h3>
            <p>{props.description}</p>
            <a href={props.link} target="_blank">Voir le projet</a>
        </div>
    );
}

function Projects() {
    return (
        <div>
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
        </div>
    );
}

ReactDOM.createRoot(
    document.getElementById("react-projects")
).render(React.createElement(Projects));
