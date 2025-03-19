import { useState } from "react";

// Define types for our data
interface MangaResult {
  title: string;
  link: string;
  author: string;
  summary: string;
}

interface ChapterResult {
  chapterNumber: string;
  chapterLink: string;
  chapterTitle: string;
  chapterReadTime: string;
  orderNumber: string;
}

interface ImageResult {
  src: string;
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [results, setResults] = useState<MangaResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedManga, setSelectedManga] = useState<MangaResult | null>(null);
  const [chapters, setChapters] = useState<ChapterResult[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Search initiated for query:", searchQuery); // Log search query
    setLoading(true);
    setSelectedManga(null);
    setChapters([]);
    setImages([]);

    try {
      const searchUrl = `https://www.mgeko.cc/search/?search=${searchQuery}`;
      console.log("Fetching from URL:", searchUrl); // Log the search URL

      const response = await fetch(searchUrl);
      const html = await response.text();

      // Log the first part of the HTML response
      console.log("HTML response preview:", html.substring(0, 500));

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Log all available classes in the document
      console.log(
        "Available classes in document:",
        Array.from(doc.querySelectorAll("*"))
          .map((el) => el.className)
          .filter(Boolean)
      );

      const mangaItems = doc.querySelectorAll(".novel-item");
      console.log(`Found ${mangaItems.length} manga items`); // Log number of items found

      // Log the HTML of the first manga item if it exists
      if (mangaItems.length > 0) {
        console.log("First manga item HTML:", mangaItems[0].outerHTML);
      }

      const mangaResults = Array.from(mangaItems).map((item, index) => {
        const titleElement = item.querySelector(".novel-title") as HTMLElement;
        const linkElement = item.querySelector("a") as HTMLAnchorElement;
        const authorElement = item.querySelector(".text1row") as HTMLElement;
        const summaryElement = item.querySelector(".summary") as HTMLElement;

        // Debug log for each manga item
        console.log(`Manga ${index + 1} parsing:`, {
          titleHTML: titleElement?.outerHTML,
          linkHTML: linkElement?.outerHTML,
          authorHTML: authorElement?.outerHTML,
          summaryHTML: summaryElement?.outerHTML,
        });

        const result = {
          title: titleElement?.innerText || "Unknown Title",
          link: linkElement?.href || "#",
          author: authorElement?.innerText || "Unknown Author",
          summary:
            summaryElement?.getAttribute("title") || "No summary available",
        };

        // Log the extracted data
        console.log(`Manga ${index + 1} extracted data:`, result);

        return result;
      });

      console.log("Final processed results:", mangaResults);
      console.log(`Total manga results: ${mangaResults.length}`);

      setResults(mangaResults);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMangaSelection = async (manga: MangaResult) => {
    setSelectedManga(manga);
    setLoadingChapters(true);
    setChapters([]);
    setImages([]);

    try {
      // Construct the full URL by combining base URL with manga path
      const baseUrl = "https://www.mgeko.cc";
      const mangaPath = manga.link.replace(/^https?:\/\/[^/]+/, "");
      const cleanMangaPath = mangaPath.startsWith("/")
        ? mangaPath
        : `/${mangaPath}`;
      const mangaUrl = `${baseUrl}${cleanMangaPath}`;

      console.log("Original manga link:", manga.link);
      console.log("Cleaned manga path:", cleanMangaPath);
      console.log("Constructed manga URL:", mangaUrl);

      const response = await fetch(mangaUrl);
      const html = await response.text();
      console.log("HTML response preview:", html.substring(0, 500));

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Log available classes for debugging
      console.log(
        "Available classes in document:",
        Array.from(doc.querySelectorAll("*"))
          .map((el) => el.className)
          .filter(Boolean)
      );

      // Use the provided HTML structure to select chapter elements
      const chapterItems = doc.querySelectorAll(
        "ul.chapter-list > li.chapter-list-item"
      );
      console.log(`Found ${chapterItems.length} chapter items`);

      if (!chapterItems || chapterItems.length === 0) {
        console.error("No chapters found with the selector pattern");
        setChapters([]);
        return;
      }

      // Log first chapter item for debugging
      if (chapterItems.length > 0) {
        console.log("First chapter HTML structure:", chapterItems[0].outerHTML);
      }

      const chapterResults = Array.from(chapterItems).map((item, index) => {
        const chapterNo = item.getAttribute("data-chapterno") || "";
        const orderNo = item.getAttribute("data-orderno") || "";

        const linkElement = item.querySelector("a");
        const chapterLink = new URL(
          linkElement?.getAttribute("href") || "",
          baseUrl
        ).href;

        const chapterTitleElement = item.querySelector(".chapter-number");
        const chapterTitle =
          chapterTitleElement?.textContent?.trim() || "Chapter";

        const chapterReadTimeElement = item.querySelector(".chapter-stats");
        const chapterReadTime =
          chapterReadTimeElement?.textContent?.trim() || "";

        const result = {
          chapterNumber: chapterNo,
          chapterLink,
          chapterTitle,
          chapterReadTime,
          orderNumber: orderNo || chapterNo || "0",
        };

        console.log(`Chapter ${index + 1} data:`, result);
        return result;
      });

      // Sort chapters by their order number (descending to show newest first)
      chapterResults.sort(
        (a, b) =>
          parseInt(b.orderNumber || "0") - parseInt(a.orderNumber || "0")
      );

      console.log("Final processed chapters:", chapterResults);
      setChapters(chapterResults);
    } catch (error) {
      console.error("Error fetching chapter list:", error);
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleChapterSelection = async (chapter: ChapterResult) => {
    setLoadingImages(true);
    setImages([]);

    try {
      console.log("Fetching chapter images from:", chapter.chapterLink);

      const response = await fetch(chapter.chapterLink);
      const html = await response.text();
      console.log("Chapter HTML response preview:", html.substring(0, 500));

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Use the provided HTML structure to select image elements
      const imageItems = doc.querySelectorAll("#chapter-reader img");
      console.log(`Found ${imageItems.length} image items`);

      if (!imageItems || imageItems.length === 0) {
        console.error("No images found with the selector pattern");
        setImages([]);
        return;
      }

      const imageResults = Array.from(imageItems).map((item, index) => {
        const src = item.getAttribute("src") || "";

        const result = {
          src,
        };

        console.log(`Image ${index + 1} data:`, result);
        return result;
      });

      console.log("Final processed images:", imageResults);
      setImages(imageResults);
    } catch (error) {
      console.error("Error fetching chapter images:", error);
    } finally {
      setLoadingImages(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-12 text-center">
        {/* Header */}
        <header className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Manga Search
            </h1>
          </div>
        </header>

        {/* Search Section */}
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
              >
                🔍
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        <div className="mt-10 w-full max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : selectedManga ? (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-purple-400">
                  {selectedManga.title}
                </h2>
                <button
                  onClick={() => setSelectedManga(null)}
                  className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Search
                </button>
              </div>
              <p className="text-gray-400 mb-2">{selectedManga.author}</p>
              <p className="text-gray-300 mb-6">{selectedManga.summary}</p>

              <h3 className="text-xl font-bold mb-4 text-left">Chapters</h3>

              {loadingChapters ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : chapters.length > 0 ? (
                <div className="text-left">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-gray-400">
                      Found {chapters.length} chapters
                    </span>
                    <span className="text-sm text-gray-400">
                      Sorted by newest first
                    </span>
                  </div>
                  <ul className="space-y-2 max-h-96 overflow-y-auto text-left">
                    {chapters.map((chapter, index) => (
                      <li
                        key={index}
                        className="border-b border-gray-700 py-2 cursor-pointer"
                        onClick={() => handleChapterSelection(chapter)}
                      >
                        <div className="text-purple-400 hover:underline flex justify-between items-center">
                          <div className="flex flex-col">
                            <span>Chapter {chapter.chapterNumber}</span>
                            <span className="text-gray-300 text-sm">
                              {chapter.chapterTitle}
                            </span>
                          </div>
                          {chapter.chapterReadTime && (
                            <span className="text-xs text-gray-500">
                              {chapter.chapterReadTime}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No chapters found for this manga.</p>
              )}

              {images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 text-left">Images</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image.src}
                        alt={`Manga panel ${index + 1}`}
                        className="w-full"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-6">
              {results.length > 0
                ? results.map((manga, index) => (
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
                : searchQuery &&
                  !loading && (
                    <p>No results found. Try a different search term.</p>
                  )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
