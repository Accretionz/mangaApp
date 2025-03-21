import { useLocation, useNavigate } from "react-router-dom";
import { MangaResult } from "../types/manga";

export const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];

  const handleMangaSelection = (manga: MangaResult) => {
    console.log("Original manga link:", manga.link);

    const mangaPath = manga.link.replace(/^https?:\/\/[^/]+/, "");
    const cleanMangaPath = mangaPath.startsWith("/")
      ? mangaPath
      : `/${mangaPath}`;

    // Extract manga ID from the path segments
    const pathSegments = cleanMangaPath.split("/").filter(Boolean);
    const mangaId = pathSegments[1] || ""; // Get the second segment after 'manga'

    // Update the manga object with the full URL and proper path
    const baseUrl = "https://www.mgeko.cc";
    const updatedManga = {
      ...manga,
      link: `${baseUrl}${cleanMangaPath}`,
    };

    console.log("Selected manga:", updatedManga);
    console.log("Clean manga path:", cleanMangaPath);
    console.log("Extracted manga ID:", mangaId);

    if (!mangaId) {
      console.error("Could not extract manga ID from path:", cleanMangaPath);
      return;
    }

    // Navigate using the manga ID
    navigate(`/manga/${mangaId}`, {
      state: {
        manga: updatedManga,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-12 text-center">
        <div className="mt-10 w-full max-w-4xl mx-auto">
          <ul className="space-y-6">
            {results.length > 0 ? (
              results.map((manga: MangaResult, index: number) => (
                <li
                  key={index}
                  className="bg-gray-800 p-4 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleMangaSelection(manga)}
                >
                  <h3 className="text-xl font-bold text-purple-400 hover:underline">
                    {manga.title}
                  </h3>
                  <p className="text-gray-400">{manga.author}</p>
                  <p className="text-gray-300">{manga.summary}</p>
                </li>
              ))
            ) : (
              <p>No results found. Try a different search term.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
