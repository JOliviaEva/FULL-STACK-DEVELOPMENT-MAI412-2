"""
Seeds the database with:
  - a course catalog (used for content-based recommendations)
  - 12 months of synthetic per-skill job-posting mention counts (used for
    trend forecasting / skill-decay scoring)
  - a pool of synthetic demo users with their own skill profiles and some
    simulated accept/reject feedback (gives the collaborative-filtering
    signal and the persona-clustering step something real to work with)

None of this requires an OpenAI key — it's plain deterministic data
generation — so the app is fully explorable immediately after `python -m
app.seed_data`, and gets smarter once a real key is added since extraction /
embeddings / explanations switch over automatically.

Run:  python -m app.seed_data           (skips if already seeded)
      python -m app.seed_data --reset   (wipes seed data first)
"""
import random
import sys

from app.auth_utils import hash_password
from app.database import Base, SessionLocal, engine
from app.models import Course, Feedback, JobPosting, Recommendation, Skill, SkillTrend, User, UserSkill
from app.skill_taxonomy import SKILL_TAXONOMY

random.seed(42)

COURSES = [
    # (title, provider, level, description, skills)
    ("Applied Machine Learning Foundations", "Coursera", "beginner",
     "Hands-on introduction to supervised/unsupervised ML with scikit-learn.",
     ["Machine Learning", "Python", "Statistics"]),
    ("Deep Learning Specialization", "edX", "advanced",
     "Neural networks, CNNs and RNNs from first principles to production.",
     ["Deep Learning", "PyTorch", "Machine Learning"]),
    ("LLM Engineering & Prompt Design", "DeepLearning.AI", "intermediate",
     "Build production LLM apps: prompting, evaluation, and tool use.",
     ["LLM Engineering", "Prompt Engineering", "Python"]),
    ("Retrieval-Augmented Generation in Practice", "DeepLearning.AI", "advanced",
     "Design RAG pipelines with vector databases and reranking.",
     ["RAG", "Vector Databases", "LLM Engineering"]),
    ("MLOps: Productionizing ML Systems", "Coursera", "advanced",
     "CI/CD for models, monitoring, and drift detection.",
     ["MLOps", "Docker", "Kubernetes", "Machine Learning"]),
    ("Natural Language Processing with Transformers", "Hugging Face", "intermediate",
     "Transformer architectures and fine-tuning for NLP tasks.",
     ["NLP", "Deep Learning", "Python"]),
    ("Computer Vision Fundamentals", "Udacity", "intermediate",
     "Image classification, detection and segmentation pipelines.",
     ["Computer Vision", "PyTorch", "Deep Learning"]),
    ("Generative AI for Product Builders", "Coursera", "beginner",
     "Practical generative AI patterns for product teams.",
     ["Generative AI", "Prompt Engineering", "Product Management"]),

    ("Data Analysis with Python & Pandas", "Coursera", "beginner",
     "Clean, transform and analyze real-world datasets.",
     ["Data Analysis", "Python", "SQL"]),
    ("Data Engineering on the Modern Stack", "Udacity", "advanced",
     "Build robust ETL pipelines with Spark and dbt.",
     ["Data Engineering", "ETL Pipelines", "Apache Spark", "dbt"]),
    ("Storytelling with Data Visualization", "edX", "beginner",
     "Turn analysis into decisions with Tableau and Power BI.",
     ["Data Visualization", "Tableau", "Power BI", "Data Storytelling"]),
    ("Experimentation & A/B Testing", "Coursera", "intermediate",
     "Design and analyze experiments that hold up statistically.",
     ["A/B Testing", "Statistics", "Data Analysis"]),

    ("AWS Certified Solutions Architect Prep", "AWS Training", "intermediate",
     "Design resilient, cost-effective systems on AWS.",
     ["AWS", "System Design", "Linux"]),
    ("Kubernetes for Developers", "Linux Foundation", "intermediate",
     "Deploy and operate containerized workloads at scale.",
     ["Kubernetes", "Docker", "CI/CD"]),
    ("Infrastructure as Code with Terraform", "HashiCorp Learn", "intermediate",
     "Provision cloud infrastructure reproducibly.",
     ["Terraform", "AWS", "CI/CD"]),
    ("Azure Fundamentals to AI Engineer", "Microsoft Learn", "beginner",
     "From core Azure services to deploying AI workloads.",
     ["Azure", "Machine Learning", "Cloud Security"]),
    ("Google Cloud Data Engineer Path", "GCP Training", "advanced",
     "Design data pipelines and ML systems on GCP.",
     ["GCP", "Data Engineering", "Machine Learning"]),

    ("Modern React & TypeScript", "Frontend Masters", "intermediate",
     "Build production React apps with hooks and TypeScript.",
     ["React", "TypeScript", "REST APIs"]),
    ("Node.js & GraphQL API Design", "Udemy", "intermediate",
     "Design robust, well-typed backend APIs.",
     ["Node.js", "GraphQL", "REST APIs"]),
    ("System Design for Engineers", "Educative", "advanced",
     "Scale systems: caching, sharding, queues, trade-offs.",
     ["System Design", "AWS", "Kubernetes"]),
    ("UI/UX Design for Product Engineers", "Coursera", "beginner",
     "Design thinking and prototyping for technical builders.",
     ["UI/UX Design", "Product Management"]),

    ("Cybersecurity Foundations", "Coursera", "beginner",
     "Core concepts of threat modeling and defense.",
     ["Cybersecurity", "Linux", "Identity & Access Management"]),
    ("Cloud Security Engineering", "SANS", "advanced",
     "Secure multi-cloud environments end to end.",
     ["Cloud Security", "AWS", "Cybersecurity"]),
    ("Applied Penetration Testing", "Offensive Security", "advanced",
     "Ethical hacking methodology and reporting.",
     ["Penetration Testing", "Cybersecurity", "Linux"]),

    ("Product Management Foundations", "Coursera", "beginner",
     "From discovery to roadmap to launch.",
     ["Product Management", "Stakeholder Communication", "Agile/Scrum"]),
    ("Agile Leadership & Delivery", "Scrum.org", "intermediate",
     "Lead cross-functional teams through delivery.",
     ["Agile/Scrum", "Leadership", "Project Management"]),
    ("Business Analysis & Data Storytelling", "edX", "intermediate",
     "Translate data into business decisions stakeholders act on.",
     ["Business Analysis", "Data Storytelling", "Stakeholder Communication"]),
    ("Negotiation for Technical Leaders", "LinkedIn Learning", "intermediate",
     "Negotiate scope, resourcing and roadmaps with confidence.",
     ["Negotiation", "Leadership", "Stakeholder Communication"]),
]

# Skills we generate 12-month trend histories for, each tagged with a shape.
TREND_SHAPES = {
    # rising
    "LLM Engineering": "rising", "Prompt Engineering": "rising", "RAG": "rising",
    "Generative AI": "rising", "Vector Databases": "rising", "MLOps": "rising",
    "Machine Learning": "rising", "Cloud Security": "rising", "Kubernetes": "rising",
    "Data Engineering": "rising", "TypeScript": "rising", "System Design": "rising",
    # declining
    "jQuery": "declining", "Flash": "declining", "SOAP APIs": "declining",
    "Perl": "declining", "SVN": "declining", "Waterfall": "declining",
    # stable-ish (foundational, still steadily requested)
    "Python": "stable", "SQL": "stable", "AWS": "stable", "React": "stable",
    "Project Management": "stable", "Statistics": "stable", "Docker": "stable",
    "Linux": "stable", "Agile/Scrum": "stable",
}

ARCHETYPES = {
    "AI-Leaning Data Scientist": ["Python", "Machine Learning", "Statistics", "Deep Learning", "NLP", "SQL"],
    "LLM Product Engineer": ["Python", "LLM Engineering", "Prompt Engineering", "RAG", "React", "Product Management"],
    "Cloud Platform Engineer": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Linux"],
    "Data Analyst": ["SQL", "Data Analysis", "Data Visualization", "Tableau", "Power BI", "Statistics"],
    "Full-Stack Web Developer": ["React", "Node.js", "TypeScript", "REST APIs", "SQL"],
    "Security Engineer": ["Cybersecurity", "Cloud Security", "AWS", "Linux", "Identity & Access Management"],
    "Product Manager": ["Product Management", "Stakeholder Communication", "Agile/Scrum", "Data Storytelling"],
    "MLOps Engineer": ["MLOps", "Docker", "Kubernetes", "Machine Learning", "Python", "AWS"],
    "Data Engineer": ["Data Engineering", "ETL Pipelines", "Apache Spark", "dbt", "SQL", "Python"],
    "Business Analyst": ["Business Analysis", "Data Storytelling", "Stakeholder Communication", "SQL"],
}

MONTHS = [f"2025-{m:02d}" for m in range(9, 13)] + [f"2026-{m:02d}" for m in range(1, 9)]  # 12 months


def get_or_create_skill(db, name, category=None):
    skill = db.query(Skill).filter(Skill.name.ilike(name)).first()
    if skill:
        return skill
    if category is None:
        for cat, skills in SKILL_TAXONOMY.items():
            if name in skills:
                category = cat
                break
        category = category or "general"
    skill = Skill(name=name, category=category)
    db.add(skill)
    db.flush()
    return skill


def seed_courses(db):
    for title, provider, level, desc, skills in COURSES:
        if db.query(Course).filter(Course.title == title).first():
            continue
        import json as _json

        db.add(Course(
            title=title, provider=provider, level=level, description=desc,
            skills_json=_json.dumps(skills), url=f"https://example-learning.com/{title.lower().replace(' ', '-')}",
        ))
    db.commit()
    print(f"Seeded {len(COURSES)} courses.")


def seed_trends(db):
    for skill_name, shape in TREND_SHAPES.items():
        skill = get_or_create_skill(db, skill_name)
        if db.query(SkillTrend).filter(SkillTrend.skill_id == skill.id).first():
            continue
        base = random.randint(40, 90)
        for i, period in enumerate(MONTHS):
            if shape == "rising":
                value = base + i * random.randint(6, 14) + random.randint(-5, 5)
            elif shape == "declining":
                value = max(2, base - i * random.randint(5, 10) + random.randint(-4, 4))
            else:
                value = base + random.randint(-6, 6)
            db.add(SkillTrend(skill_id=skill.id, period=period, mention_count=max(0, int(value))))
    db.commit()
    print(f"Seeded trend history for {len(TREND_SHAPES)} skills across {len(MONTHS)} months.")


def seed_users_and_feedback(db):
    if db.query(User).filter(User.is_seed == True).first():  # noqa: E712
        print("Seed users already exist, skipping.")
        return

    courses = db.query(Course).all()
    seed_password = hash_password("demo-seed-user-not-a-real-login")

    created = 0
    for i in range(28):
        archetype_name, base_skills = random.choice(list(ARCHETYPES.items()))
        email = f"seed.user{i+1}@synthetic.doppelganger.ai"
        user = User(
            email=email, hashed_password=seed_password,
            full_name=f"Synthetic {archetype_name} #{i+1}", is_seed=True,
        )
        db.add(user)
        db.flush()

        chosen = random.sample(base_skills, k=min(len(base_skills), random.randint(3, len(base_skills))))
        for skill_name in chosen:
            skill = get_or_create_skill(db, skill_name)
            db.add(UserSkill(
                user_id=user.id, skill_id=skill.id,
                proficiency=round(random.uniform(0.4, 0.95), 2), source="seed",
            ))
        chosen_set = set(chosen)

        # simulate a handful of past recommendation interactions using cheap
        # keyword-overlap scoring (no OpenAI calls during seeding)
        scored_courses = []
        for c in courses:
            overlap = len(chosen_set & set(c.skills_list()))
            if overlap > 0:
                scored_courses.append((c, overlap))
        scored_courses.sort(key=lambda t: t[1], reverse=True)

        for course, overlap in scored_courses[:random.randint(2, 5)]:
            score = min(0.95, 0.35 + 0.15 * overlap)
            rec = Recommendation(
                user_id=user.id, course_id=course.id, score=score,
                content_score=score, collab_score=0.0,
                reason="Synthetic seed interaction used to bootstrap collaborative filtering.",
            )
            roll = random.random()
            if roll < 0.55:
                rec.status = random.choice(["accepted", "completed"])
            elif roll < 0.8:
                rec.status = "rejected"
            else:
                rec.status = "pending"
            db.add(rec)
            db.flush()
            if rec.status != "pending":
                action = "complete" if rec.status == "completed" else ("accept" if rec.status == "accepted" else "reject")
                db.add(Feedback(user_id=user.id, recommendation_id=rec.id, action=action))

        created += 1

    db.commit()
    print(f"Seeded {created} synthetic demo users with skills + simulated feedback.")


def reset(db):
    print("Resetting seed data...")
    db.query(Feedback).delete()
    db.query(Recommendation).delete()
    db.query(UserSkill).delete()
    db.query(User).filter(User.is_seed == True).delete()  # noqa: E712
    db.query(SkillTrend).delete()
    db.query(Course).delete()
    db.query(JobPosting).delete()
    db.commit()


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if "--reset" in sys.argv:
            reset(db)
        seed_courses(db)
        seed_trends(db)
        seed_users_and_feedback(db)
        print("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
