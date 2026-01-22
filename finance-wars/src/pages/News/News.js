import { useEffect, useState } from "react";
import "./News.css";

function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
  `https://gnews.io/api/v4/top-headlines?topic=business&country=in&token=9e17c6d978c01c37d9833919b991cb89`
);

        const data = await response.json();
        setArticles(data.articles || []);
      } catch (error) {
        console.error("Error fetching news", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="news-page">
      <h1>Market News</h1>

      {loading && <p>Loading news...</p>}

      {!loading && articles.length === 0 && (
        <p>No news available</p>
      )}

      <div className="news-grid">
        {articles.map((news, index) => (
          <div className="news-card" key={index}>
            <h3>{news.title}</h3>
<p>{news.description || "Click to read full article"}</p>
<a href={news.url} target="_blank" rel="noreferrer">
  Read more →
</a>

          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
