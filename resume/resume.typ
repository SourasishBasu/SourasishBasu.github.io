// The resume. Edit the words here; the layout lives in template.typ.
// Markup: *bold*, _italic_, `- ` starts a point, `--` is an en dash, `//` comments a line out.
// The site builds this into /resume/ and /resume.pdf on every deploy.

#import "template.typ": *

#show: resume.with(
  name: "Sourasish Basu",
  contacts: (
    (icon: "at", label: "sourasishbasu06@gmail.com", url: "mailto:sourasishbasu06@gmail.com"),
    (icon: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/sourasishbasu"),
    (icon: "github", label: "GitHub", url: "https://github.com/SourasishBasu"),
  ),
)

= Work Experience

#role(name: "Atlan", place: "Remote", title: "Platform Engineer Intern", dates: [June 2025 *--* Present])[
  - Drove cloud cost optimization initiatives, to reduce cost as % of ARR and improve operating margins by performing RCA of cost spikes, and enhancing cost visibility across tenant infrastructure.
  - Built self-service dashboards with Grafana and Sigma, integrating data from VictoriaMetrics, Snowflake, and Mixpanel to provide cross-functional teams with actionable insights for data-driven optimization.
  - Developed robust distributed alerting workflows in Go using Temporal, ensuring timely detection of anomalies and improving infrastructure reliability.
]

#role(name: "Anonymous Digital Marketing Pvt Ltd.", place: "Kolkata, IN", title: "Software Engineer Intern", dates: [June 2024 *--* Oct 2024])[
  - Developed a highly available web app for employee management and fraud prevention for the National Restaurant Association of India, reducing employee fraud by *35%* and boosting onboarding efficiency by *60%* across 200+ FnB businesses.
  - Built RESTful APIs with Flask, optimized PostgreSQL operations for significantly faster response times, and deployed scalable AWS infrastructure with Docker, CI/CD pipelines along with Grafana & Prometheus for monitoring to achieve *99.9%* uptime while reducing manual intervention by *40%*.
]

// = Leadership Experience
//
// #role(name: "Microsoft Learn Student Ambassadors", place: "Bhubaneswar, IN", title: "Cloud Domain Lead", dates: [Jan 2023 *--* Apr 2025])[
//   - Led cross-domain collaboration to organize cloud workshops and hackathons attended by *1000+* students while architecting scalable AI-native solutions for 10+ projects across AWS, Azure, and DigitalOcean platforms.
// ]

= Projects

#project(name: "VaultAssist", url: "https://github.com/3xCaffeine/mcp-server/")[
  - Built a secure MCP server in TypeScript that exposes 50+ Google Workspace tools (Gmail, Drive, Calendar, Docs, Sheets, Slides, Tasks) through OAuth 2.1, sequential thinking, and graph-database-backed memory, enabling natural-language automation and cross-service context management for personal AI assistants.
  - Automated container build and deployment workflows by implementing GitHub Actions CI/CD pipelines, improving release speed.
]

#project(name: "Ledgerly", url: "https://github.com/SourasishBasu/ledgerly")[
  - Developed an open source, versatile expense tracking platform using NextJS and FastAPI in Python leveraging AWS services (ECR, Lambda, S3, EC2, RDS) for backend functionality and Gemini for OCR capabilities.
  - Implemented comprehensive monitoring and observability solutions, including Prometheus, Grafana, and GoAccess, alongside containerization with Docker and automated CI/CD pipelines using GitHub Actions.
]

#project(name: "RAGnarok", url: "https://github.com/3xCaffeine/RAGnarok")[
  - Built an AI-driven documentation assistant leveraging *RAG* to provide accurate, context-aware responses across various professional domains, while handling diverse input types such as text, audio, images, PDFs.
  - Implemented a comprehensive tech stack with FastAPI, Docker and AstraDB Vector Store, integrating multiple SoTA *LLMs* (Gemini, Groq's Deepseek R1 Distill Llama 70B) and Nomic-Embed-Text embeddings together with *LlamaIndex* and custom plugins for enhanced functionality, deployed on *DigitalOcean*.
]

= Education

#role(name: "Kalinga Institute of Industrial Technology", place: "Bhubaneswar, IN", title: "B.Tech. in Computer Science Engineering", dates: [Expected June 2026])[]

= Skills

#skills(
  ("Languages and Databases", "Python, C, SQL, Go, Bash, Postgres, MongoDB, Snowflake, Redis/Valkey, Qdrant"),
  ("Cloud and DevOps Tools", "Github, AWS, Azure, GCP, Docker, Cloudflare, Azure, Jenkins, Ansible, Terraform, Prometheus, Grafana, Kubernetes, OpenTelemetry, ELK Stack, DataDog, Argo Workflows, Temporal, n8n, Fivetran"),
  ("Frameworks and Libraries", "FastAPI, FastMCP, Gin, Google ADK, LangChain, Langsmith, FAISS, Seaborn, vLLM"),
)

= Certifications

#award(name: "Oracle Cloud Infrastructure 2024 Certified Foundations Associate", date: "July 2024")
