import ProjectCard from './ProjectCard';

const ArchivedProjects = ({ projects }) => (
  <section id="archived" className="archived-section">
    <h2>Archived Projects</h2>
    <div className="projects-grid">
      {projects.filter((p) => p.archived).map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  </section>
);

export default ArchivedProjects;
