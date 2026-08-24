/**
 * Extracts the 11-character YouTube Video ID from a variety of YouTube URLs.
 * Handles standard (watch?v=), shortened (youtu.be), shorts (/shorts/), and embed URLs.
 * 
 * @param {string} url - The YouTube URL
 * @returns {string|null} - The 11-character video ID, or null if not found
 */
export const extractYouTubeId = (url) => {
  if (!url) return null;
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  
  return match ? match[1] : null;
};
