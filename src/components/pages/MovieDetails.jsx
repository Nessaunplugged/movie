import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Movie Details:", data);
        setMovie(data);
      })
      .catch((error) => console.error("API Error:", error));
  }, [id]);

  const handleWatch = () => {
    const searchQuery = encodeURIComponent(movie.name || movie.original_name);
    window.open(`https://www.google.com/search?q=watch+${searchQuery}+online`, '_blank');
  };

  if (!movie) return <p>Loading...</p>;

  return (
    <div className="details">
      <Link to="/" className="back">
        Back
      </Link>
      <h2>{movie.name}</h2>
      <img
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.name}
      />
      <button onClick={handleWatch} className="watch-btn">Watch Now</button>
      <p>
        <b>Genres:</b>
        {movie.genres?.map((g) => g.name).join(", ")}
      </p>
      <p>
        <b>Overview:</b>
        {movie.overview}
      </p>
      <p>
        <b>First Air Date:</b>
        {movie.first_air_date}
      </p>
      <p>
        <b>Episodes:</b>
        {movie.number_of_episodes}
      </p>
      <p>
        <b>Seasons:</b>
        {movie.number_of_seasons}
      </p>
    </div>
  );
}

export default MovieDetails;
