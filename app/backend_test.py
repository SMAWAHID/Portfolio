#!/usr/bin/env python3
"""
Backend API Testing Suite for Portfolio Website
Tests all CRUD endpoints as specified in contracts.md
"""

import requests
import json
from datetime import datetime
import uuid

# Base URL from frontend/.env
BASE_URL = "https://craft-resume-12.preview.emergentagent.com/api"

class PortfolioAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def test_hello_world(self):
        """Test GET /api/ -> returns {message: 'Hello World'}"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Hello World":
                    self.log_test("Hello World endpoint", True)
                    return True
                else:
                    self.log_test("Hello World endpoint", False, f"Expected 'Hello World', got: {data}")
            else:
                self.log_test("Hello World endpoint", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Hello World endpoint", False, f"Exception: {str(e)}")
        return False
        
    def test_status_endpoints(self):
        """Test POST /api/status and GET /api/status"""
        try:
            # Test POST /api/status
            client_data = {"client_name": "Syed Mawahid Hussain"}
            response = self.session.post(f"{BASE_URL}/status", json=client_data)
            
            if response.status_code == 200:
                status_check = response.json()
                if "id" in status_check and "client_name" in status_check and "timestamp" in status_check:
                    self.log_test("POST /api/status", True, f"Created status check with ID: {status_check['id']}")
                    
                    # Test GET /api/status
                    get_response = self.session.get(f"{BASE_URL}/status")
                    if get_response.status_code == 200:
                        status_list = get_response.json()
                        if isinstance(status_list, list) and len(status_list) > 0:
                            # Check if our created status is in the list
                            found = any(s.get("id") == status_check["id"] for s in status_list)
                            if found:
                                self.log_test("GET /api/status", True, f"Found {len(status_list)} status checks")
                                return True
                            else:
                                self.log_test("GET /api/status", False, "Created status not found in list")
                        else:
                            self.log_test("GET /api/status", False, "Empty or invalid status list")
                    else:
                        self.log_test("GET /api/status", False, f"Status: {get_response.status_code}")
                else:
                    self.log_test("POST /api/status", False, f"Missing required fields in response: {status_check}")
            else:
                self.log_test("POST /api/status", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Status endpoints", False, f"Exception: {str(e)}")
        return False
        
    def test_profile_endpoints(self):
        """Test PUT /api/profile and GET /api/profile"""
        try:
            # Sample profile data
            profile_data = {
                "full_name": "Syed Mawahid Hussain",
                "title": "Full Stack Developer",
                "headline": "Passionate developer with expertise in React, FastAPI, and MongoDB",
                "university": "University of Technology",
                "location": "San Francisco, CA",
                "availability": True,
                "summary": "Experienced full-stack developer with 5+ years in web development, specializing in modern JavaScript frameworks and Python backend services.",
                "links": {
                    "github": "https://github.com/syedmawahid",
                    "linkedin": "https://linkedin.com/in/syedmawahid",
                    "email": "syed.mawahid@example.com",
                    "resume": "https://example.com/resume.pdf"
                }
            }
            
            # Test PUT /api/profile
            response = self.session.put(f"{BASE_URL}/profile", json=profile_data)
            
            if response.status_code == 200:
                created_profile = response.json()
                if "id" in created_profile and created_profile.get("full_name") == profile_data["full_name"]:
                    self.log_test("PUT /api/profile", True, f"Created profile with ID: {created_profile['id']}")
                    
                    # Test GET /api/profile
                    get_response = self.session.get(f"{BASE_URL}/profile")
                    if get_response.status_code == 200:
                        retrieved_profile = get_response.json()
                        if retrieved_profile.get("full_name") == profile_data["full_name"]:
                            self.log_test("GET /api/profile", True, "Profile retrieved successfully")
                            return True
                        else:
                            self.log_test("GET /api/profile", False, "Retrieved profile doesn't match created profile")
                    else:
                        self.log_test("GET /api/profile", False, f"Status: {get_response.status_code}")
                else:
                    self.log_test("PUT /api/profile", False, f"Invalid response: {created_profile}")
            else:
                self.log_test("PUT /api/profile", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Profile endpoints", False, f"Exception: {str(e)}")
        return False
        
    def test_projects_endpoints(self):
        """Test Projects CRUD operations"""
        try:
            # Create two projects
            project1 = {
                "title": "Portfolio Website",
                "description": "A modern portfolio website built with React and FastAPI",
                "tags": ["React", "FastAPI", "MongoDB", "Tailwind CSS"],
                "category": "Web Development",
                "year": 2024,
                "live": "https://portfolio.example.com",
                "repo": "https://github.com/syedmawahid/portfolio"
            }
            
            project2 = {
                "title": "E-commerce Platform",
                "description": "Full-featured e-commerce platform with payment integration",
                "tags": ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
                "category": "Full Stack",
                "year": 2023,
                "live": "https://ecommerce.example.com",
                "repo": "https://github.com/syedmawahid/ecommerce"
            }
            
            # POST first project
            response1 = self.session.post(f"{BASE_URL}/projects", json=project1)
            if response1.status_code != 200:
                self.log_test("POST /api/projects (project 1)", False, f"Status: {response1.status_code}")
                return False
                
            created_project1 = response1.json()
            project1_id = created_project1.get("id")
            
            # POST second project
            response2 = self.session.post(f"{BASE_URL}/projects", json=project2)
            if response2.status_code != 200:
                self.log_test("POST /api/projects (project 2)", False, f"Status: {response2.status_code}")
                return False
                
            created_project2 = response2.json()
            self.log_test("POST /api/projects", True, "Created 2 projects successfully")
            
            # GET projects list
            get_response = self.session.get(f"{BASE_URL}/projects")
            if get_response.status_code == 200:
                projects_list = get_response.json()
                if len(projects_list) >= 2:
                    self.log_test("GET /api/projects", True, f"Retrieved {len(projects_list)} projects")
                    
                    # PUT update project title
                    updated_project1 = created_project1.copy()
                    updated_project1["title"] = "Updated Portfolio Website"
                    
                    put_response = self.session.put(f"{BASE_URL}/projects/{project1_id}", json=updated_project1)
                    if put_response.status_code == 200:
                        updated_project = put_response.json()
                        if updated_project.get("title") == "Updated Portfolio Website":
                            self.log_test("PUT /api/projects/{id}", True, "Project title updated successfully")
                            
                            # DELETE project
                            delete_response = self.session.delete(f"{BASE_URL}/projects/{project1_id}")
                            if delete_response.status_code == 200:
                                delete_result = delete_response.json()
                                if delete_result.get("ok") is True:
                                    self.log_test("DELETE /api/projects/{id}", True, "Project deleted successfully")
                                    return True
                                else:
                                    self.log_test("DELETE /api/projects/{id}", False, f"Unexpected response: {delete_result}")
                            else:
                                self.log_test("DELETE /api/projects/{id}", False, f"Status: {delete_response.status_code}")
                        else:
                            self.log_test("PUT /api/projects/{id}", False, "Title not updated correctly")
                    else:
                        self.log_test("PUT /api/projects/{id}", False, f"Status: {put_response.status_code}")
                else:
                    self.log_test("GET /api/projects", False, f"Expected at least 2 projects, got {len(projects_list)}")
            else:
                self.log_test("GET /api/projects", False, f"Status: {get_response.status_code}")
                
        except Exception as e:
            self.log_test("Projects endpoints", False, f"Exception: {str(e)}")
        return False
        
    def test_skills_endpoints(self):
        """Test Skills PUT and GET operations"""
        try:
            # Create skills data with 2 groups
            skills_data = [
                {
                    "group": "Frontend Technologies",
                    "items": [
                        {"name": "React", "level": 9},
                        {"name": "JavaScript", "level": 9},
                        {"name": "TypeScript", "level": 8},
                        {"name": "Tailwind CSS", "level": 8}
                    ]
                },
                {
                    "group": "Backend Technologies",
                    "items": [
                        {"name": "Python", "level": 9},
                        {"name": "FastAPI", "level": 8},
                        {"name": "MongoDB", "level": 7},
                        {"name": "PostgreSQL", "level": 7}
                    ]
                }
            ]
            
            # PUT skills
            response = self.session.put(f"{BASE_URL}/skills", json=skills_data)
            if response.status_code == 200:
                created_skills = response.json()
                if len(created_skills) == 2:
                    self.log_test("PUT /api/skills", True, "Created 2 skill groups successfully")
                    
                    # GET skills
                    get_response = self.session.get(f"{BASE_URL}/skills")
                    if get_response.status_code == 200:
                        retrieved_skills = get_response.json()
                        if len(retrieved_skills) == 2:
                            # Check structure
                            first_group = retrieved_skills[0]
                            if "group" in first_group and "items" in first_group:
                                self.log_test("GET /api/skills", True, "Skills structure matches expected format")
                                return True
                            else:
                                self.log_test("GET /api/skills", False, "Invalid skills structure")
                        else:
                            self.log_test("GET /api/skills", False, f"Expected 2 groups, got {len(retrieved_skills)}")
                    else:
                        self.log_test("GET /api/skills", False, f"Status: {get_response.status_code}")
                else:
                    self.log_test("PUT /api/skills", False, f"Expected 2 groups, created {len(created_skills)}")
            else:
                self.log_test("PUT /api/skills", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Skills endpoints", False, f"Exception: {str(e)}")
        return False
        
    def test_blog_endpoints(self):
        """Test Blog CRUD operations"""
        try:
            # Create blog post
            blog_post = {
                "title": "Building Modern Web Applications with FastAPI and React",
                "excerpt": "Learn how to create scalable web applications using FastAPI backend and React frontend",
                "content": "In this comprehensive guide, we'll explore how to build modern web applications using FastAPI for the backend and React for the frontend. We'll cover everything from setting up the development environment to deploying your application to production.",
                "tags": ["FastAPI", "React", "Web Development", "Python"],
                "date": "2024-01-15",
                "likes": 0
            }
            
            # POST blog
            response = self.session.post(f"{BASE_URL}/blog", json=blog_post)
            if response.status_code == 200:
                created_post = response.json()
                post_id = created_post.get("id")
                self.log_test("POST /api/blog", True, f"Created blog post with ID: {post_id}")
                
                # GET blog list
                get_response = self.session.get(f"{BASE_URL}/blog")
                if get_response.status_code == 200:
                    blog_list = get_response.json()
                    if len(blog_list) > 0:
                        self.log_test("GET /api/blog", True, f"Retrieved {len(blog_list)} blog posts")
                        
                        # GET specific blog post
                        get_post_response = self.session.get(f"{BASE_URL}/blog/{post_id}")
                        if get_post_response.status_code == 200:
                            retrieved_post = get_post_response.json()
                            if retrieved_post.get("title") == blog_post["title"]:
                                self.log_test("GET /api/blog/{id}", True, "Retrieved specific blog post successfully")
                                
                                # PUT update blog (likes and content)
                                updated_post = created_post.copy()
                                updated_post["likes"] = 5
                                updated_post["content"] = "Updated content: " + updated_post["content"]
                                
                                put_response = self.session.put(f"{BASE_URL}/blog/{post_id}", json=updated_post)
                                if put_response.status_code == 200:
                                    updated_result = put_response.json()
                                    if updated_result.get("likes") == 5:
                                        self.log_test("PUT /api/blog/{id}", True, "Blog post updated successfully")
                                        
                                        # DELETE blog post
                                        delete_response = self.session.delete(f"{BASE_URL}/blog/{post_id}")
                                        if delete_response.status_code == 200:
                                            delete_result = delete_response.json()
                                            if delete_result.get("ok") is True:
                                                self.log_test("DELETE /api/blog/{id}", True, "Blog post deleted successfully")
                                                return True
                                            else:
                                                self.log_test("DELETE /api/blog/{id}", False, f"Unexpected response: {delete_result}")
                                        else:
                                            self.log_test("DELETE /api/blog/{id}", False, f"Status: {delete_response.status_code}")
                                    else:
                                        self.log_test("PUT /api/blog/{id}", False, "Likes not updated correctly")
                                else:
                                    self.log_test("PUT /api/blog/{id}", False, f"Status: {put_response.status_code}")
                            else:
                                self.log_test("GET /api/blog/{id}", False, "Retrieved post doesn't match created post")
                        else:
                            self.log_test("GET /api/blog/{id}", False, f"Status: {get_post_response.status_code}")
                    else:
                        self.log_test("GET /api/blog", False, "No blog posts found")
                else:
                    self.log_test("GET /api/blog", False, f"Status: {get_response.status_code}")
            else:
                self.log_test("POST /api/blog", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Blog endpoints", False, f"Exception: {str(e)}")
        return False
        
    def test_contact_endpoint(self):
        """Test Contact POST operation"""
        try:
            # Create contact message
            contact_data = {
                "name": "John Smith",
                "email": "john.smith@example.com",
                "message": "Hello Syed, I'm interested in discussing a potential project collaboration. Could we schedule a call to discuss the requirements?"
            }
            
            # POST contact
            response = self.session.post(f"{BASE_URL}/contact", json=contact_data)
            if response.status_code == 200:
                result = response.json()
                if result.get("ok") is True:
                    self.log_test("POST /api/contact", True, "Contact message submitted successfully")
                    return True
                else:
                    self.log_test("POST /api/contact", False, f"Unexpected response: {result}")
            else:
                self.log_test("POST /api/contact", False, f"Status: {response.status_code}")
                
        except Exception as e:
            self.log_test("Contact endpoint", False, f"Exception: {str(e)}")
        return False
        
    def check_cors_headers(self):
        """Check if CORS headers are present"""
        try:
            # Use GET request with Origin header to trigger CORS response
            headers = {"Origin": "https://example.com"}
            response = self.session.get(f"{BASE_URL}/", headers=headers)
            
            cors_headers = [
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials"
            ]
            
            present_headers = []
            for header in cors_headers:
                if header.lower() in [h.lower() for h in response.headers.keys()]:
                    present_headers.append(header)
                    
            if len(present_headers) > 0:
                self.log_test("CORS Headers", True, f"Found headers: {', '.join(present_headers)}")
                return True
            else:
                self.log_test("CORS Headers", False, "No CORS headers found")
                
        except Exception as e:
            self.log_test("CORS Headers", False, f"Exception: {str(e)}")
        return False
        
    def run_all_tests(self):
        """Run all tests and return summary"""
        print(f"🚀 Starting Portfolio API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 60)
        
        tests = [
            ("Hello World", self.test_hello_world),
            ("Status Endpoints", self.test_status_endpoints),
            ("Profile Endpoints", self.test_profile_endpoints),
            ("Projects Endpoints", self.test_projects_endpoints),
            ("Skills Endpoints", self.test_skills_endpoints),
            ("Blog Endpoints", self.test_blog_endpoints),
            ("Contact Endpoint", self.test_contact_endpoint),
            ("CORS Headers", self.check_cors_headers)
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🧪 Testing {test_name}...")
            if test_func():
                passed += 1
            else:
                failed += 1
                
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {passed} passed, {failed} failed")
        
        if failed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
                    
        return passed, failed, self.test_results

if __name__ == "__main__":
    tester = PortfolioAPITester()
    passed, failed, results = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    exit(0 if failed == 0 else 1)