from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")
# Admin router (secured) will be defined later
admin_router = APIRouter(prefix="/api/admin")



# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ===================== Portfolio Models =====================
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class Links(BaseModel):
    model_config = ConfigDict(extra="ignore")
    github: Optional[str] = None
    linkedin: Optional[str] = None
    email: Optional[str] = None
    resume: Optional[str] = None

class ProfileUpsert(BaseModel):
    full_name: str
    title: str
    headline: Optional[str] = None
    university: Optional[str] = None
    location: Optional[str] = None
    availability: bool = True
    summary: Optional[str] = None
    links: Links = Links()

# ===================== Email via Resend =====================
import resend
RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

async def send_contact_email(name: str, email: str, message: str):
    if not RESEND_API_KEY:
        return {"sent": False, "reason": "RESEND_API_KEY not set"}
    try:
        params = {
            "from": os.environ.get("RESEND_FROM", "Portfolio <noreply@resend.dev>"),
            "to": [os.environ.get("RESEND_TO", email)],
            "subject": f"New contact message from {name}",
            "html": f"""
                <h2>New Message</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>Message:</strong></p>
                <p>{message}</p>
            """,
        }
        resp = resend.Emails.send(params)
        return {"sent": True, "id": resp.get("id") if isinstance(resp, dict) else None}
    except Exception as e:
        logger.error(f"Resend send error: {e}")
        return {"sent": False, "reason": str(e)}


class Profile(ProfileUpsert):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class SkillItem(BaseModel):
    name: str
    level: int

class SkillGroup(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group: str
    items: List[SkillItem]

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    tags: List[str] = []
    category: str
    year: int
    live: Optional[str] = None
    repo: Optional[str] = None

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str
    tags: List[str] = []
    date: str
    likes: int = 0

class ContactCreate(BaseModel):
    name: str
    email: str
    message: str

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ===================== Helpers =====================

def collection(name: str):
    return db[name]

# ===================== Profile =====================
@api_router.get("/profile", response_model=Profile)
async def get_profile():
    doc = await collection("profile").find_one({}, {"_id": 0})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Profile not found")
    return Profile(**doc)

@api_router.put("/profile", response_model=Profile)
async def upsert_profile(payload: ProfileUpsert):
    existing = await collection("profile").find_one({}, {"_id": 0})
    pid = existing.get("id") if existing else str(uuid.uuid4())
    data = Profile(id=pid, **payload.model_dump()).model_dump()
    await collection("profile").update_one({}, {"$set": data}, upsert=True)
    return Profile(**data)

# ===================== Projects =====================
@api_router.get("/projects", response_model=List[Project])
async def list_projects():
    docs = await collection("projects").find({}, {"_id": 0}).to_list(1000)
    return [Project(**d) for d in docs]

@api_router.post("/projects", response_model=Project)
async def create_project(p: Project):
    data = p.model_dump()
    await collection("projects").insert_one(data)
    return p

@api_router.put("/projects/{pid}", response_model=Project)
async def update_project(pid: str, p: Project):
    data = p.model_dump()
    data["id"] = pid
    await collection("projects").update_one({"id": pid}, {"$set": data}, upsert=False)
    return Project(**data)

@api_router.delete("/projects/{pid}")
async def delete_project(pid: str):
    await collection("projects").delete_one({"id": pid})
    return {"ok": True}

# ===================== Skills =====================
@api_router.get("/skills", response_model=List[SkillGroup])
async def get_skills():
    docs = await collection("skills").find({}, {"_id": 0}).to_list(1000)
    return [SkillGroup(**d) for d in docs]

@api_router.put("/skills", response_model=List[SkillGroup])
async def put_skills(payload: List[SkillGroup]):
    await collection("skills").delete_many({})
    docs = [p.model_dump() for p in payload]
    if docs:
        await collection("skills").insert_many(docs)
    return [SkillGroup(**d) for d in docs]

# ===================== Blog =====================
@api_router.get("/blog", response_model=List[BlogPost])
async def list_blog():
    docs = await collection("blog").find({}, {"_id": 0}).sort("date", -1).to_list(1000)
    return [BlogPost(**d) for d in docs]

@api_router.post("/blog", response_model=BlogPost)
async def create_blog(post: BlogPost):
    data = post.model_dump()
    await collection("blog").insert_one(data)
    return post

@api_router.get("/blog/{bid}", response_model=BlogPost)
async def get_blog(bid: str):
    doc = await collection("blog").find_one({"id": bid}, {"_id": 0})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Blog post not found")
    return BlogPost(**doc)

@api_router.put("/blog/{bid}", response_model=BlogPost)
async def update_blog(bid: str, post: BlogPost):
    data = post.model_dump()
    data["id"] = bid
    await collection("blog").update_one({"id": bid}, {"$set": data}, upsert=False)
    return BlogPost(**data)

@api_router.delete("/blog/{bid}")
async def delete_blog(bid: str):
    await collection("blog").delete_one({"id": bid})
    return {"ok": True}

# ===================== Contact =====================
@api_router.post("/contact")
async def create_contact(msg: ContactCreate):
    doc = ContactMessage(name=msg.name, email=msg.email, message=msg.message)
    to_store = doc.model_dump()
    to_store['created_at'] = to_store['created_at'].isoformat()
    await collection("contact_messages").insert_one(to_store)
    email_result = await send_contact_email(msg.name, msg.email, msg.message)
    return {"ok": True, "email": email_result}


# ===================== Admin Minimal (Token-based) =====================
from fastapi import Header, HTTPException, Depends

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

async def require_admin(x_admin_token: str = Header(None)):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin is not configured")
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

@admin_router.post("/projects", dependencies=[Depends(require_admin)], response_model=Project)
async def admin_create_project(p: Project):
    data = p.model_dump()
    await collection("projects").insert_one(data)
    return p

@admin_router.put("/projects/{pid}", dependencies=[Depends(require_admin)], response_model=Project)
async def admin_update_project(pid: str, p: Project):
    data = p.model_dump()
    data["id"] = pid
    await collection("projects").update_one({"id": pid}, {"$set": data}, upsert=False)
    return Project(**data)

@admin_router.delete("/projects/{pid}", dependencies=[Depends(require_admin)])
async def admin_delete_project(pid: str):
    await collection("projects").delete_one({"id": pid})
    return {"ok": True}

@admin_router.put("/skills", dependencies=[Depends(require_admin)], response_model=List[SkillGroup])
async def admin_put_skills(payload: List[SkillGroup]):
    await collection("skills").delete_many({})
    docs = [p.model_dump() for p in payload]
    if docs:
        await collection("skills").insert_many(docs)
    return [SkillGroup(**d) for d in docs]

@admin_router.post("/blog", dependencies=[Depends(require_admin)], response_model=BlogPost)
async def admin_create_blog(post: BlogPost):
    data = post.model_dump()
    await collection("blog").insert_one(data)
    return post

@admin_router.put("/blog/{bid}", dependencies=[Depends(require_admin)], response_model=BlogPost)
async def admin_update_blog(bid: str, post: BlogPost):
    data = post.model_dump()
    data["id"] = bid
    await collection("blog").update_one({"id": bid}, {"$set": data}, upsert=False)
    return BlogPost(**data)

@admin_router.delete("/blog/{bid}", dependencies=[Depends(require_admin)])
async def admin_delete_blog(bid: str):
    await collection("blog").delete_one({"id": bid})
    return {"ok": True}

# Mount admin
app.include_router(admin_router)


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()