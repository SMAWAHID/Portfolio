import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
const API = `${BASE}/api`;

const http = axios.create({ baseURL: API, withCredentials: false });

// Profile
export const getProfile = async () => http.get(`/profile`).then(r=>r.data);
export const putProfile = async (payload) => http.put(`/profile`, payload).then(r=>r.data);

// Projects
export const listProjects = async () => http.get(`/projects`).then(r=>r.data);
export const createProject = async (p) => http.post(`/projects`, p).then(r=>r.data);
export const updateProject = async (id, p) => http.put(`/projects/${id}`, p).then(r=>r.data);
export const deleteProject = async (id) => http.delete(`/projects/${id}`).then(r=>r.data);

// Skills
export const getSkills = async () => http.get(`/skills`).then(r=>r.data);
export const putSkills = async (groups) => http.put(`/skills`, groups).then(r=>r.data);

// Blog
export const listBlog = async () => http.get(`/blog`).then(r=>r.data);
export const getBlog = async (id) => http.get(`/blog/${id}`).then(r=>r.data);
export const createBlog = async (post) => http.post(`/blog`, post).then(r=>r.data);
export const updateBlog = async (id, post) => http.put(`/blog/${id}`, post).then(r=>r.data);
export const deleteBlog = async (id) => http.delete(`/blog/${id}`).then(r=>r.data);

// Contact
export const postContact = async (payload) => http.post(`/contact`, payload).then(r=>r.data);

// Seed helpers (dev only) – avoids duplicates with localStorage flag
export async function ensureSeed(seed) {
  const seededKey = `portfolio_seed_done_v2`;
  if (typeof window !== 'undefined' && localStorage.getItem(seededKey)) return;
  try {
    // Profile
    try { await getProfile(); } catch (e) { if (e?.response?.status === 404) { await putProfile(seed.profilePayload); } }
    // Projects
    const proj = await listProjects();
    if (!Array.isArray(proj) || proj.length === 0) {
      for (const p of seed.projects) await createProject(p);
    }
    // Skills
    const sk = await getSkills();
    if (!Array.isArray(sk) || sk.length === 0) {
      await putSkills(seed.skills);
    }
    // Blog
    const blog = await listBlog();
    if (!Array.isArray(blog) || blog.length === 0) {
      for (const b of seed.blog) await createBlog(b);
    }
    if (typeof window !== 'undefined') localStorage.setItem(seededKey, '1');
  } catch (err) {
    // fail silently for dev; frontend will still render using live fetch or mock fallback
    console.warn('Seed failed (non-blocking):', err?.message || err);
  }
}

export default http;
