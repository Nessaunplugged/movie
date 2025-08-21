import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    { name: "All", value: "" },
    { name: "K-Drama", value: "korean" },
    { name: "Bollywood", value: "hindi" },
    { name: "Anime", value: "japanese" },
    { name: "Turkish", value: "turkish" },
    { name: "Spanish", value: "spanish" },
    { name: "Action", value: "action" },
    { name: "Comedy", value: "comedy" },
    { name: "Drama", value: "drama" }
  ];

  const fetchMovies = (query = "", category = "") => {
    setLoading(true);
    let url;
    
    if (query) {
      url = `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}`;
    } else if (category) {
      if (category === "korean" || category === "hindi" || category === "japanese" || category === "turkish" || category === "spanish") {
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=${category === "korean" ? "ko" : category === "hindi" ? "hi" : category === "japanese" ? "ja" : category === "turkish" ? "tr" : "es"}`;
      } else {
        const genreMap = { action: "10759", comedy: "35", drama: "18" };
        url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreMap[category]}`;
      }
    } else {
      url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213`;
    }
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setMovies(data.results || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchMovies(searchTerm);
    } else {
      fetchMovies("", selectedCategory);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchTerm("");
    fetchMovies("", category);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => handleCategoryChange(category.value)}
            className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for TV shows..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">Search</button>
      </form>
      
      <h2>
        {searchTerm 
          ? `Search Results for "${searchTerm}"` 
          : selectedCategory 
            ? `${categories.find(c => c.value === selectedCategory)?.name} Shows`
            : "Popular Shows"
        }
      </h2>
      <p>Found {movies.length} shows</p>
      <div className="grid">
        {movies.length > 0 ? (
          movies.map((movie) => (
            <Link key={movie.id} to={`/movie/${movie.id}`} className="card">
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.name || movie.original_name}
              />
              <h3>{movie.name || movie.original_name}</h3>
            </Link>
          ))
        ) : (
          <p>No movies found. Check console for API errors.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
