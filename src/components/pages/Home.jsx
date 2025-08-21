import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

// Get auth headers - prefer Bearer token over API key
const getAuthHeaders = () => {
  if (ACCESS_TOKEN) {
    return {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };
  }
  return {};
};

// Get auth URL parameter
const getAuthParam = () => {
  return ACCESS_TOKEN ? '' : `api_key=${API_KEY}`;
};

// Test API authentication
const testApiAuth = async () => {
  if (!API_KEY && !ACCESS_TOKEN) {
    console.error("❌ No API key or access token found in environment variables");
    return false;
  }
  
  try {
    const authParam = getAuthParam();
    const url = `${BASE_URL}/configuration${authParam ? `?${authParam}` : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (response.ok) {
      console.log("✅ TMDB authentication is valid");
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error("❌ TMDB authentication failed:", response.status, errorData.status_message || response.statusText);
      return false;
    }
  } catch (error) {
    console.error("❌ Error testing TMDB authentication:", error);
    return false;
  }
};

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
    
    if (!API_KEY && !ACCESS_TOKEN) {
      console.error("❌ TMDB credentials missing! Check your .env file.");
      setLoading(false);
      return;
    }
    
    const authParam = getAuthParam();
    let url;
    
    if (query) {
      url = `${BASE_URL}/search/tv?${authParam}&query=${encodeURIComponent(query)}`;
    } else if (category) {
      if (category === "korean" || category === "hindi" || category === "japanese" || category === "turkish" || category === "spanish") {
        const langMap = { korean: "ko", hindi: "hi", japanese: "ja", turkish: "tr", spanish: "es" };
        url = `${BASE_URL}/discover/tv?${authParam}&with_original_language=${langMap[category]}`;
      } else {
        const genreMap = { action: "10759", comedy: "35", drama: "18" };
        url = `${BASE_URL}/discover/tv?${authParam}&with_genres=${genreMap[category]}`;
      }
    } else {
      url = `${BASE_URL}/discover/tv?${authParam}&with_networks=213`;
    }
    
    // Clean URL if using Bearer token
    if (ACCESS_TOKEN) {
      url = url.replace('?&', '?').replace(/^([^?]+)\?$/, '$1');
    }
    
    console.log("🔍 Fetching from:", url.replace(API_KEY || '', "***HIDDEN***"));
    
    fetch(url, {
      headers: getAuthHeaders()
    })
      .then((res) => {
        console.log("📡 Response:", res.status, res.statusText);
        if (!res.ok) {
          return res.json().then(errorData => {
            throw new Error(`HTTP ${res.status}: ${errorData.status_message || res.statusText}`);
          }).catch(() => {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Success! Found", data.results?.length || 0, "results");
        setMovies(data.results || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ API Error:", error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    testApiAuth().then((isValid) => {
      if (isValid) {
        fetchMovies();
      } else {
        setLoading(false);
      }
    });
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
