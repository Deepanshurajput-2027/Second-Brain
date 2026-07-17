import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../logger/logger.js';

export class ExtractorService {
  /**
   * Extract deep text content based on the source type
   * @param {string} sourceType - YOUTUBE, URL, ARTICLE, etc.
   * @param {string} sourceUrl - The URL of the source
   * @param {string} rawContent - The fallback raw content (e.g. title or user provided content)
   * @returns {Promise<string>} The extracted text or the fallback raw content
   */
  static async extract(sourceType, sourceUrl, rawContent) {
    try {
      if (sourceType === 'YOUTUBE' && sourceUrl) {
        logger.info(`Extracting YouTube transcript for URL: ${sourceUrl}`);
        const transcript = await YoutubeTranscript.fetchTranscript(sourceUrl);
        return transcript.map(t => t.text).join(' ');
      }

      if ((sourceType === 'URL' || sourceType === 'ARTICLE') && sourceUrl) {
        logger.info(`Extracting web content for URL: ${sourceUrl}`);
        const response = await axios.get(sourceUrl, { timeout: 15000 });
        const $ = cheerio.load(response.data);
        
        // Strip out scripts, styles, and navigational elements
        $('script, style, nav, footer, header, aside, iframe, noscript').remove();
        
        // Extract main body text and clean up whitespace
        const text = $('body').text().replace(/\s+/g, ' ').trim();
        return text || rawContent;
      }

      // Default fallback for unstructured text or unsupported types
      return rawContent;
    } catch (error) {
      logger.error(`ExtractorService failed for ${sourceType} (${sourceUrl}): ${error.message}`);
      return rawContent;
    }
  }
}
