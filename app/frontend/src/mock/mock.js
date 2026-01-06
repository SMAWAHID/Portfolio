// Frontend-only mock data populated with your details. Replace with backend API later.
export const profile = {
  name: "Syed Mawahid Hussain",
  fullName: "Syed Mawahid Hussain",
  title: "CS Undergraduate @ FAST-NUCES | Aspiring Software & Cloud Engineer",
  headline: "Turning Ideas into Intelligent, Scalable Software.",
  university: "FAST NUCES — Karachi",
  location: "Karachi, Pakistan",
  availability: true,
  summary:
    "I’m a Computer Science undergraduate at FAST-NUCES passionate about building smart, data‑driven, and scalable software. I love React, FastAPI, Java, and Python to solve real‑world problems and craft meaningful experiences.",
  links: {
    github: "https://github.com/smawahid",
    linkedin: "https://www.linkedin.com/in/syed-mawahid-hussain-ab951b180/",
    email: "mailto:hafizmawahid2775@gmail.com",
    resume: "https://drive.google.com/file/d/1iwA3-yB-hmxbQ4d5TpgHp25QbEV8rkKH/view?usp=drive_open"
  },
  resume: {
    filename: "resume_mock.json",
    data: {
      name: "Syed Mawahid Hussain",
      title: "CS Undergraduate @ FAST-NUCES",
      university: "FAST NUCES — Karachi",
      contacts: {
        email: "hafizmawahid2775@gmail.com",
        city: "Karachi, Pakistan"
      },
      skills: [
        "Java",
        "Python",
        "JavaScript/TypeScript",
        "React/Next.js",
        "FastAPI",
        "TensorFlow",
        "MongoDB",
        "MySQL",
        "Docker"
      ]
    }
  }
}

export const skills = [
  { group: "Languages", items: [
    { name: "Java", level: 85 },
    { name: "Python", level: 82 },
    { name: "JavaScript/TypeScript", level: 80 },
    { name: "C/C++", level: 65 }
  ]},
  { group: "Frameworks/Libraries", items: [
    { name: "React / Next.js", level: 85 },
    { name: "FastAPI", level: 78 },
    { name: "ASP.NET Core", level: 60 },
    { name: "TensorFlow", level: 55 }
  ]},
  { group: "Databases", items: [
    { name: "MongoDB", level: 78 },
    { name: "MySQL", level: 70 },
    { name: "SQL Server", level: 60 }
  ]},
  { group: "Cloud/Tools", items: [
    { name: "Docker", level: 65 },
    { name: "Git & GitHub", level: 80 },
    { name: "Firebase / Vercel", level: 70 },
    { name: "Postman", level: 75 }
  ]}
]

export const services = [
  { title: "Full‑stack Web Apps", description: "From responsive UI to scalable APIs using React, Next.js, FastAPI.", icon: "Rocket" },
  { title: "AI Integrations", description: "TensorFlow/LLM powered features and prototypes.", icon: "Brain" },
  { title: "Automation Workflows", description: "Python scripts, Make.com workflows, and API automations.", icon: "Wrench" }
]

export const projects = [
  {
    id: "p1",
    title: "Voice Emotion Recognition System",
    description: "Full‑stack AI system analyzing voice input to detect emotions in real time. Backend handles feature extraction and inference; frontend visualizes live results.",
    tags: ["Python", "FastAPI", "TensorFlow", "React", "Librosa"],
    category: "AI/ML",
    year: 2025,
    live: "#",
    repo: "https://github.com/smawahid"
  },
  {
    id: "p2",
    title: "8‑Way Traffic Controller (DLD)",
    description: "Microcontroller‑based system simulating traffic logic for eight‑way intersections. Built with Arduino and Proteus timing visuals.",
    tags: ["Arduino", "Proteus", "Embedded"],
    category: "Systems",
    year: 2024,
    live: "#",
    repo: "https://github.com/smawahid"
  },
  {
    id: "p3",
    title: "YouTube Shorts Automation",
    description: "Automated pipeline to create and upload Shorts from trends using Python scripts and Make.com workflows.",
    tags: ["Python", "Make.com", "YouTube API"],
    category: "Automation",
    year: 2025,
    live: "#",
    repo: "https://github.com/smawahid"
  },
  {
    id: "p4",
    title: "Expository Writing Email Project",
    description: "A 20‑minute collaborative video explaining professional email writing principles; scripted, produced, and edited.",
    tags: ["Communication", "Video"],
    category: "Media",
    year: 2024,
    live: "#",
    repo: "https://github.com/smawahid"
  }
]

export const blogPosts = [
  {
    id: "b1",
    title: "Real‑time Emotion Recognition from Voice — Notes",
    excerpt: "Signal processing pipeline, features, and deployment considerations.",
    content: `Walkthrough of MFCC extraction, spectrograms, and model serving with FastAPI...`,
    tags: ["AI/ML", "FastAPI"],
    date: "2025-07-01",
    likes: 0
  }
]

export const contactConfig = {
  emailTo: "hafizmawahid2775@gmail.com"
}
