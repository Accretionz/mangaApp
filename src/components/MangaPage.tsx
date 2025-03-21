import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChapterResult, ImageResult, MangaResult } from "../types/manga";

export const MangaPage = () => {
  const location = useLocation();
  const manga = location.state?.manga as MangaResult;

  const [selectedManga, setSelectedManga] = useState<MangaResult | null>(null);
  const [chapters, setChapters] = useState<ChapterResult[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [images, setImages] = useState<ImageResult[]>([]);

  useEffect(() => {
    if (manga) {
      setSelectedManga(manga);
      fetchChapters(manga);
    }
  }, [manga]);

  const fetchChapters = async (manga: MangaResult) => {
    setLoadingChapters(true);
    try {
      const baseUrl = "https://www.mgeko.cc";
      const mangaPath = manga.link.replace(/^https?:\/\/[^/]+/, "");
      const cleanMangaPath = mangaPath.startsWith("/")
        ? mangaPath
        : `/${mangaPath}`;
      const mangaUrl = `${baseUrl}${cleanMangaPath}`;

      // Use a CORS proxy
      const corsProxy = "https://api.allorigins.win/raw?url=";
      const proxyUrl = `${corsProxy}${encodeURIComponent(mangaUrl)}`;

      console.log("Fetching chapters from URL:", proxyUrl);

      const response = await fetch(proxyUrl);
      const html = await response.text();

      console.log("HTML Response:", html.substring(0, 500));

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

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
      setChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  };

  const handleChapterSelection = async (chapter: ChapterResult) => {
    setImages([]);

    try {
      const corsProxy = "https://api.allorigins.win/raw?url=";
      const proxyUrl = `${corsProxy}${encodeURIComponent(chapter.chapterLink)}`;

      console.log("Fetching chapter images from:", proxyUrl);

      const response = await fetch(proxyUrl);
      const html = await response.text();
      console.log("Chapter HTML response preview:", html.substring(0, 500));

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const imageItems = doc.querySelectorAll("#chapter-reader img");
      console.log(`Found ${imageItems.length} image items`);

      if (!imageItems || imageItems.length === 0) {
        console.error("No images found with the selector pattern");
        setImages([]);
        return;
      }

      const imageResults = Array.from(imageItems).map((item) => {
        const src = item.getAttribute("src") || "";
        return { src };
      });

      console.log("Final processed images:", imageResults);
      setImages(imageResults);
    } catch (error) {
      console.error("Error fetching chapter images:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="flex-grow flex flex-col items-center justify-center container mx-auto px-4 py-12 text-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-purple-400">
              {selectedManga?.title}
            </h2>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Search
            </Link>
          </div>
          <p className="text-gray-400 mb-2">{selectedManga?.author}</p>
          <p className="text-gray-300 mb-6">{selectedManga?.summary}</p>

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
      </div>
    </div>
  );
};
