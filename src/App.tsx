import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SearchPage } from "./components/SearchPage";
import { MangaPage } from "./components/MangaPage";
import { ResultsPage } from "./components/ResultPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/manga/:id" element={<MangaPage />} />
      </Routes>
    </Router>
  );
}

export default App;
