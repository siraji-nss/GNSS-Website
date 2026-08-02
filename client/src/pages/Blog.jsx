import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, resolveMediaUrl } from '../api/client';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog').then(setPosts).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">GlobalNest Blog</span>
          <h1>Scholarships, Visa Updates &amp; Student Life</h1>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : posts.length === 0 ? (
            <p className="text-muted">No posts published yet — check back soon.</p>
          ) : (
            <div className="grid grid-3">
              {posts.map((p) => (
                <Link to={`/blog/${p.slug}`} key={p.id} className="card blog-card">
                  <div className="blog-card__media" style={p.cover_image ? { backgroundImage: `url(${resolveMediaUrl(p.cover_image)})` } : undefined} />
                  <div className="blog-card__body">
                    <h4>{p.title}</h4>
                    <p className="text-muted">{p.excerpt}</p>
                    <span className="link-arrow">Read More &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
