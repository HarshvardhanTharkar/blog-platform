const request = require('supertest');
const mongoose = require('mongoose');
process.env.MONGO_URI_TEST = 'mongodb://localhost:27017/blogplatform_test_blog';
const app = require('../app');
const User = require('../models/User');
const Blog = require('../models/Blog');

process.env.NODE_ENV = 'test';


let token;
let userId;
let blogId;

describe('Blog API', () => {
  beforeAll(async () => {
    await new Promise((res) => setTimeout(res, 500));
    await User.deleteMany({});
    await Blog.deleteMany({});

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Blog Author', email: 'author@example.com', password: 'Password1' });

    token = res.body.data.token;
    userId = res.body.data.user._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Blog.deleteMany({});
    await mongoose.connection.close();
  });

  // ── Create Blog ───────────────────────────────────────────────────────────
  describe('POST /api/blogs', () => {
    it('should create a blog when authenticated', async () => {
      const res = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My First Blog Post',
          content: 'This is a detailed content of the blog post. '.repeat(5),
          tags: ['Tech', 'JavaScript'],
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.blog.title).toBe('My First Blog Post');
      expect(res.body.data.blog.tags).toContain('tech');
      blogId = res.body.data.blog._id;
    });

    it('should reject blog creation without auth', async () => {
      const res = await request(app)
        .post('/api/blogs')
        .send({ title: 'Test', content: 'Content here...' });
      expect(res.statusCode).toBe(401);
    });

    it('should reject blog with short title', async () => {
      const res = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hi', content: 'Content here...'.repeat(5) });
      expect(res.statusCode).toBe(422);
    });
  });

  // ── Get All Blogs ─────────────────────────────────────────────────────────
  describe('GET /api/blogs', () => {
    it('should return paginated blogs', async () => {
      const res = await request(app).get('/api/blogs');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('blogs');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.blogs)).toBe(true);
    });

    it('should support pagination params', async () => {
      const res = await request(app).get('/api/blogs?page=1&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.pagination.limit).toBe(5);
    });
  });

  // ── Get Blog By ID ────────────────────────────────────────────────────────
  describe('GET /api/blogs/:id', () => {
    it('should return a single blog', async () => {
      const res = await request(app).get(`/api/blogs/${blogId}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.blog._id).toBe(blogId);
    });

    it('should return 404 for non-existent blog', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/blogs/${fakeId}`);
      expect(res.statusCode).toBe(404);
    });
  });

  // ── Update Blog ───────────────────────────────────────────────────────────
  describe('PUT /api/blogs/:id', () => {
    it('should update blog by author', async () => {
      const res = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Blog Title Here',
          content: 'Updated content that is long enough to pass validation. '.repeat(3),
          tags: ['updated'],
        });
      expect(res.statusCode).toBe(200);
expect(res.body.data.blog.title).toBe('Updated Blog Title Here');
    });

    it('should reject update from non-author', async () => {
      // Create second user
      const res2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Other User', email: 'other@example.com', password: 'Password1' });
      const otherToken = res2.body.data.token;

      const res = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: 'Hijacked Title Attempt Here',
          content: 'Injected content that is long enough. '.repeat(3),
          tags: [],
        });
      expect(res.statusCode).toBe(403);
    });
  });

  // ── Delete Blog ───────────────────────────────────────────────────────────
  describe('DELETE /api/blogs/:id', () => {
    it('should delete blog by author', async () => {
      const res = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should return 404 after deletion', async () => {
      const res = await request(app).get(`/api/blogs/${blogId}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
