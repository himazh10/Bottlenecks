const DEFAULT_SKILLS = ['Machine Learning', 'Web Dev', 'Data Science'];

const SkillsSection = ({ skills = DEFAULT_SKILLS }) => (
  <section id="skills" className="skills-section">
    <h2>Skills</h2>
    <div className="skills-grid">
      {skills.map((skill) => (
        <div key={skill} className="skill-pill">{skill}</div>
      ))}
    </div>
  </section>
);

export default SkillsSection;
