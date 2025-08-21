import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/pages/Home";
import MovieDetails from "./components/pages/MovieDetails";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header>
        <Link to="/" className="logo">
          NMovies
        </Link>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MovieDetails />} />
      </Routes>
    </div>
  );
}

export default App;
