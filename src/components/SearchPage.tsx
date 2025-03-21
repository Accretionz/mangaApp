import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const searchUrl = `https://www.mgeko.cc/search/?search=${searchQuery}`;
      const response = await fetch(searchUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const mangaItems = doc.querySelectorAll(".novel-item");
      const results = Array.from(mangaItems).map((item) => ({
        title:
          item.querySelector(".novel-title")?.textContent?.trim() ||
          "Unknown Title",
        link: item.querySelector("a")?.getAttribute("href") || "#",
        author:
          item.querySelector(".text1row")?.textContent?.trim() ||
          "Unknown Author",
        summary:
          item.querySelector(".summary")?.getAttribute("title") ||
          "No summary available",
      }));

      navigate("/results", { state: { results } });
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-12 text-center">
        <header className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Manga Search
          </h1>
        </header>

        <div className="max-w-2xl w-full mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div
              className={`relative transition-all duration-300 ${
                isSearchFocused
                  ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20"
                  : ""
              }`}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search for manga titles..."
                className="w-full px-5 py-4 pr-12 rounded-full bg-gray-800 border border-gray-700 focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-full hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                disabled={loading}
              >
                {loading ? "..." : "🔍"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
