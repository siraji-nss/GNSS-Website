import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, resolveMediaUrl } from '../api/client';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setNotFound(false);
    setPost(null);
    api.get(`/blog/${slug}`).then(setPost).catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    if (post?.title) document.title = `${post.title} | GlobalNest Blog`;
  }, [post]);

  if (notFound) {
    return (
      <div className="section container center">
        <h1>Post Not Found</h1>
        <Link to="/blog" className="btn btn-primary">Back to Blog</Link>
      </div>
    );
  }

  if (!post) return <div className="section container">Loading...</div>;

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <span className="eyebrow">{post.author} &middot; {new Date(post.published_at).toLocaleDateString()}</span>
          <h1>{post.title}</h1>
        </div>
      </div>

      <section className="section">
        <div className="container blog-post">
          {post.cover_image && <img src={resolveMediaUrl(post.cover_image)} alt={post.title} className="blog-post__cover" />}
          {post.content.split('\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <Link to="/blog" className="btn btn-outline btn-sm">&larr; Back to Blog</Link>
        </div>
      </section>
    </>
  );
}
