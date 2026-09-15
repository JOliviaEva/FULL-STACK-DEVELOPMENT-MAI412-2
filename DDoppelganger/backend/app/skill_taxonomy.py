"""
A curated taxonomy used to (a) seed the demo course/job/trend data and
(b) power the non-AI fallback keyword extractor when no OpenAI key is set.
Categories are used for the skill-radar chart grouping.
"""

SKILL_TAXONOMY = {
    "Programming": [
        "Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust", "SQL", "R",
    ],
    "AI / ML": [
        "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "LLM Engineering",
        "Prompt Engineering", "RAG", "PyTorch", "TensorFlow", "Scikit-learn", "MLOps",
        "Generative AI", "Vector Databases",
    ],
    "Data": [
        "Data Analysis", "Data Engineering", "Data Visualization", "ETL Pipelines",
        "Statistics", "A/B Testing", "Power BI", "Tableau", "Apache Spark", "dbt",
    ],
    "Cloud & DevOps": [
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux",
    ],
    "Web & Product": [
        "React", "Node.js", "REST APIs", "GraphQL", "UI/UX Design", "Product Management",
        "Agile/Scrum", "System Design",
    ],
    "Security": [
        "Cybersecurity", "Cloud Security", "Penetration Testing", "Identity & Access Management",
    ],
    "Business & Soft Skills": [
        "Project Management", "Stakeholder Communication", "Leadership", "Business Analysis",
        "Negotiation", "Data Storytelling",
    ],
}

ALL_SKILLS = [skill for skills in SKILL_TAXONOMY.values() for skill in skills]

SKILL_TO_CATEGORY = {
    skill: category for category, skills in SKILL_TAXONOMY.items() for skill in skills
}
