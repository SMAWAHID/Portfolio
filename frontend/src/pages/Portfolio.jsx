import React, { useEffect, useMemo, useRef, useState } from "react";
import { profile as mockProfile, projects as mockProjects, skills as mockSkills, services as mockServices, blogPosts as mockBlog, contactConfig } from "../mock/mock";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useToast } from "../hooks/use-toast";
import { Toaster } from "../components/ui/toaster";
import { Github, Linkedin, Mail, MapPin, Download, ExternalLink, ArrowRight, Rocket, GraduationCap, Brain, Wrench, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Hero3D from "../components/Hero3D";
import { ensureSeed, getProfile, putProfile, listProjects, getSkills, listBlog, updateBlog, postContact } from "../lib/api";

// Accent variables updated to cyan/blue scheme per preference
const Accent = {
  primary: "#22d3ee", // cyan-400
  secondary: "#60a5fa", // blue-400
  surfaceCard: "#111315"
};

function useLocalState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);
  return [state, setState];
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || theme === undefined;
  return (
    <Button variant="outline" onClick={() => setTheme(isDark ? "light" : "dark")} className="gap-2 border-border text-foreground bg-transparent">
      {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? "Light" : "Dark"}
    </Button>
  );
}

function Header({ links }) {
  const items = [
    { href: "#about", label: "About" },
    { href: "#projects", label: "Projects" },
    { href: "#skills", label: "Skills" },
    { href: "#blog", label: "Blog" },
    { href: "#contact", label: "Contact" }
  ];
  const gh = links?.github || mockProfile.links.github;
  const li = links?.linkedin || mockProfile.links.linkedin;
  const em = links?.email || mockProfile.links.email;
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <a href="#top" className="font-semibold tracking-tight text-xl" style={{color: Accent.primary}}>Mawahid</a>
        <nav className="hidden md:flex items-center gap-2">
          {items.map((it) => (
            <a key={it.href} href={it.href} className="nav-link px-3 py-2 rounded-md text-sm text-foreground hover:text-muted-foreground transition-colors">
              {it.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href={gh} target="_blank" rel="noreferrer" className="p-2 rounded-md border border-border hover:bg-accent transition-colors" aria-label="GitHub">
            <Github size={18} />
          </a>
          <a href={li} target="_blank" rel="noreferrer" className="p-2 rounded-md border border-border hover:bg-accent transition-colors" aria-label="LinkedIn">
            <Linkedin size={18} />
          </a>
          <a href={em} className="p-2 rounded-md border border-border hover:bg-accent transition-colors" aria-label="Email">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero({ profile }) {
  const name = profile?.full_name || mockProfile.fullName;
  return (
    <section id="top" className="relative py-24 md:py-32">
      <div className="absolute inset-0 -z-10 opacity-30 md:opacity-40 pointer-events-none [mask-image:radial-gradient(closest-side,black,transparent)]" style={{background: `radial-gradient(600px 300px at 20% 10%, ${Accent.primary}20, transparent), radial-gradient(600px 300px at 80% 20%, ${Accent.secondary}22, transparent)`}} />
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-foreground mb-4">
            <GraduationCap size={14} /> <span>{profile?.university || mockProfile.university}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight text-foreground">
            Hi, I’m <span style={{color: Accent.primary}}>{name}</span>
          </h1>
          <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">{profile?.title || mockProfile.title}</p>
          <p className="mt-4 text-muted-foreground max-w-prose">{profile?.summary || mockProfile.summary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })} className="gap-2" style={{backgroundColor: Accent.primary, color: "#0b0c0b"}}>
              <Rocket size={16} /> View Projects
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>
              Contact Me <ArrowRight size={16} />
            </Button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin size={16} /><span>{profile?.location || mockProfile.location}</span>
            <span className="h-1 w-1 rounded-full bg-border inline-block mx-2" />
            <span>Availability: <span className="font-medium" style={{color: Accent.primary}}>{(profile?.availability ?? mockProfile.availability) ? "Open to intern roles" : "Not available"}</span></span>
          </div>
        </div>
        <div className="relative">
          <Hero3D accent={Accent.primary} secondary={Accent.secondary} />
        </div>
      </div>
    </section>
  );
}

function About({ profile }) {
  return (
    <section id="about" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1">
          <h2 className="text-2xl md:text-3xl font-bold">About</h2>
          <p className="text-sm text-muted-foreground mt-2">{profile?.headline || "Turning Ideas into Intelligent, Scalable Software"}</p>
        </div>
        <div className="md:col-span-2 grid gap-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Who am I?</CardTitle>
              <CardDescription>CS undergrad passionate about full‑stack, AI/ML, and cloud systems</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                {profile?.summary || mockProfile.summary}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
              <CardDescription>Recent projects & interests</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-3 text-sm">
                <li>• Voice Emotion Recognition (real‑time inference)</li>
                <li>• YouTube Shorts end‑to‑end automation</li>
                <li>• 8‑Way Traffic Controller simulation (Arduino/Proteus)</li>
                <li>• Exploring cloud + AI integrations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Projects({ items }) {
  const [filter, setFilter] = useState("All");
  const data = items?.length ? items : mockProjects;
  const filtered = useMemo(() => filter === "All" ? data : data.filter(p => p.category === filter), [filter, data]);

  // Simple 3D tilt effect
  const cardRefs = useRef({});
  useEffect(() => {
    const handle = (e, el) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left; const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -6; const ry = ((x / rect.width) - 0.5) * 8;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    };
    const reset = (el) => { el.style.transform = "rotateX(0deg) rotateY(0deg)"; };
    const entries = Object.values(cardRefs.current);
    entries.forEach((el) => {
      if (!el) return;
      const onMove = (e) => handle(e, el);
      const onLeave = () => reset(el);
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });
  }, [filtered]);

  const tabs = ["All", ...Array.from(new Set(data.map(p => p.category)))];

  return (
    <section id="projects" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Projects</h2>
            <p className="text-sm text-muted-foreground mt-2">Selected work and experiments</p>
          </div>
          <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
            <TabsList>
              {tabs.map((t) => (
                <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card key={p.id} className="bg-card border-border transition-transform" ref={(el) => (cardRefs.current[p.id] = el)} style={{transformStyle: "preserve-3d"}}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-2">
                  <span>{p.title}</span>
                  <Badge className="bg-secondary/80" variant="secondary">{p.year}</Badge>
                </CardTitle>
                <CardDescription>{p.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 min-h-[56px]">{p.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tags?.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" className="gap-1" style={{backgroundColor: Accent.primary, color: "#0b0c0b"}}>
                    <a href={p.live || "#"} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Live</a>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a href={p.repo || "#"} target="_blank" rel="noreferrer"><Github size={14} /> Code</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillsServices({ skills }) {
  const groups = skills?.length ? skills : mockSkills;
  return (
    <section id="skills" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Skills</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {groups.map((g) => (
              <Card key={g.group} className="bg-card">
                <CardHeader>
                  <CardTitle className="text-base">{g.group}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {g.items.map((s) => (
                    <div key={s.name} className="grid gap-1">
                      <div className="flex justify-between text-sm"><span>{s.name}</span><span className="text-muted-foreground">{s.level}%</span></div>
                      <div className="h-2 rounded bg-secondary/40 overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${s.level}%`, background: `linear-gradient(90deg, ${Accent.primary}, ${Accent.secondary})` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Services</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {mockServices.map((srv) => (
              <Card key={srv.title} className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    {srv.icon === "Rocket" && <Rocket size={16} />} {srv.icon === "Brain" && <Brain size={16} />} {srv.icon === "Wrench" && <Wrench size={16} />} {srv.title}
                  </CardTitle>
                  <CardDescription>{srv.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Blog({ posts, onLike }) {
  const data = posts?.length ? posts : mockBlog;
  return (
    <section id="blog" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-bold">Blog</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {data.map((b) => (
            <Card key={b.id} className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{b.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs"><span>{new Date(b.date).toDateString()}</span>{b.tags?.map((t)=>(<Badge key={t} variant="outline">{t}</Badge>))}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90">{b.excerpt}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => alert(b.content)}>Read</Button>
                  <Button size="sm" variant="outline" onClick={() => onLike?.(b)}>Like • {b.likes ?? 0}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact({ profile }) {
  const { toast } = useToast();
  const [form, setForm] = useLocalState("contact_form", { name: "", email: "", message: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Missing info", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    try {
      const resp = await postContact(form);
      toast({ title: "Message sent", description: resp?.email?.sent ? "Email delivered via Resend." : "Saved to backend; email not configured." });
    } catch (err) {
      toast({ title: "Submit failed", description: err?.response?.data?.detail || err.message, variant: "destructive" });
    }
    setForm({ name: "", email: "", message: "" });
  };

  const downloadResume = () => {
    const link = profile?.links?.resume || mockProfile.links.resume;
    if (link) {
      window.open(link, "_blank");
      return;
    }
    const blob = new Blob([JSON.stringify(mockProfile.resume.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = mockProfile.resume.filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="contact" className="py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Contact</h2>
          <p className="text-sm text-muted-foreground mt-2">I usually reply within 24–48 hours.</p>
          <div className="mt-4 text-sm text-muted-foreground">Email: <a href={`mailto:${contactConfig.emailTo}`} className="underline" style={{color: Accent.primary}}>{contactConfig.emailTo}</a></div>

          <div className="mt-8">
            <Button onClick={downloadResume} className="gap-2" style={{backgroundColor: Accent.primary, color: "#0b0c0b"}}>
              <Download size={16} /> Open Resume
            </Button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="grid gap-3">
          <div>
            <label className="text-sm">Name</label>
            <Input placeholder="Your name" value={form.name} onChange={(e)=>setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e)=>setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm">Message</label>
            <Textarea rows={6} placeholder="What would you like to build?" value={form.message} onChange={(e)=>setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" className="gap-2" style={{backgroundColor: Accent.primary, color: "#0b0c0b"}}>Send</Button>
            <Button type="button" variant="outline" onClick={()=>setForm({ name: "", email: "", message: "" })}>Reset</Button>
          </div>
        </form>
      </div>
      <Toaster />
    </section>
  );
}

export default function PortfolioPage() {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [posts, setPosts] = useState([]);

  // Seed with mock data on first run and then fetch live
  useEffect(() => {
    const seed = {
      profilePayload: {
        full_name: mockProfile.fullName,
        title: mockProfile.title,
        headline: mockProfile.headline || "Turning Ideas into Intelligent, Scalable Software.",
        university: mockProfile.university,
        location: mockProfile.location,
        availability: mockProfile.availability,
        summary: mockProfile.summary,
        links: {
          github: mockProfile.links.github,
          linkedin: mockProfile.links.linkedin,
          email: mockProfile.links.email.replace("mailto:", ""),
          resume: mockProfile.links.resume || ""
        }
      },
      projects: mockProjects,
      skills: mockSkills,
      blog: mockBlog.map(b => ({ ...b, likes: b.likes || 0 }))
    };
    ensureSeed(seed).then(async () => {
      try {
        let [p, pr, sk, bl] = await Promise.all([
          getProfile().catch(()=>null),
          listProjects().catch(()=>[]),
          getSkills().catch(()=>[]),
          listBlog().catch(()=>[])
        ]);
        // One-time profile sync if backend has placeholder data
        const syncKey = 'portfolio_profile_synced_v1';
        if (p && typeof window !== 'undefined' && !localStorage.getItem(syncKey)) {
          const expected = mockProfile.fullName;
          if (p.full_name !== expected) {
            p = await putProfile(seed.profilePayload);
          }
          localStorage.setItem(syncKey, '1');
        }
        setProfile(p);
        setProjects(pr);
        setSkills(sk);
        setPosts(bl);
        document.title = `${(p?.full_name || mockProfile.fullName)} — Portfolio`;
      } catch {}
    });
  }, []);

  const handleLike = async (b) => {
    try {
      const updated = { ...b, likes: (b.likes || 0) + 1 };
      await updateBlog(b.id, updated);
      setPosts((prev) => prev.map(x => x.id === b.id ? updated : x));
    } catch (e) {
      // graceful fallback: local increment only
      setPosts((prev) => prev.map(x => x.id === b.id ? { ...x, likes: (x.likes || 0) + 1 } : x));
    }
  };

  return (
    <div>
      <Header links={profile?.links} />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Projects items={projects} />
        <SkillsServices skills={skills} />
        <Blog posts={posts} onLike={handleLike} />
        <Contact profile={profile} />
      </main>
      <footer className="mt-16 border-t border-border py-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">© {new Date().getFullYear()} {(profile?.full_name || mockProfile.fullName)}. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <a href={(profile?.links?.github || mockProfile.links.github)} className="p-2 rounded-md border border-border hover:bg-accent transition-colors" target="_blank" rel="noreferrer"><Github size={16} /></a>
            <a href={(profile?.links?.linkedin || mockProfile.links.linkedin)} className="p-2 rounded-md border border-border hover:bg-accent transition-colors" target="_blank" rel="noreferrer"><Linkedin size={16} /></a>
            <a href={(profile?.links?.email ? `mailto:${profile.links.email}` : mockProfile.links.email)} className="p-2 rounded-md border border-border hover:bg-accent transition-colors"><Mail size={16} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
