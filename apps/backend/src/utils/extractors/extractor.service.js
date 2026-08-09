import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import * as cheerio from 'cheerio';
import logger from '../logger/logger.js';

export class ExtractorService {
  /**
   * Scrape dynamic web content using Jina Reader API with Cheerio fallback
   * @param {string} url - Target URL to scrape
   * @returns {Promise<string>} Clean extracted markdown or text content
   */
  static async scrapeUrl(url) {
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYouTube) {
      try {
        logger.info(`[ExtractorService] Fetching YouTube transcript for URL: ${url}`);
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        const transcriptText = transcript.map(t => t.text).join(' ');
        if (transcriptText && transcriptText.trim().length > 0) {
          return `YouTube Video Transcript:\n${transcriptText}`;
        }
      } catch (ytError) {
        logger.warn(`[ExtractorService] YouTube transcript extraction failed for ${url} (${ytError.message}), falling back to Jina/Cheerio.`);
      }
    }

    // 1. Primary: Jina Reader API for dynamic CSR and LLM-ready Markdown
    try {
      const jinaUrl = `https://r.jina.ai/${url}`;
      logger.info(`[ExtractorService] Scraping dynamic content via Jina Reader: ${jinaUrl}`);

      const response = await axios.get(jinaUrl, {
        headers: {
          'X-Return-Format': 'markdown',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/plain, text/markdown'
        },
        timeout: 10000
      });

      if (response.data && typeof response.data === 'string' && response.data.trim().length > 0) {
        return response.data.trim();
      }
    } catch (jinaError) {
      logger.warn(`[ExtractorService] Jina Reader failed for ${url}: ${jinaError.message}. Falling back to standard Cheerio extraction.`);
    }

    // 2. Fallback: Standard Axios + Cheerio direct HTTP extraction
    return await this.fallbackCheerio(url);
  }

  /**
   * Fallback scraper using standard Axios and Cheerio HTML parsing
   * @param {string} url - Target URL
   * @returns {Promise<string>} Extracted HTML text content
   */
  static async fallbackCheerio(url) {
    try {
      logger.info(`[ExtractorService] Fallback scraping with Cheerio for URL: ${url}`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const html = response.data;
      if (typeof html !== 'string') {
        return '';
      }

      const $ = cheerio.load(html);

      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[property="og:description"]').attr('content') || '';

      $('script, style, nav, footer, header, aside, iframe, noscript, svg, img, video').remove();
      
      let extractedText = '';
      $('article, main, p, h1, h2, h3, h4, h5, h6, li').each((i, el) => {
        extractedText += $(el).text() + ' ';
      });

      if (!extractedText.trim()) {
        extractedText = $('body').text();
      }

      const cleanText = extractedText.replace(/\s+/g, ' ').trim();

      const parts = [];
      if (title) parts.push(`Title: ${title.trim()}`);
      if (description) parts.push(`Description: ${description.trim()}`);
      if (cleanText) parts.push(`Content:\n${cleanText}`);

      return parts.join('\n\n') || cleanText;
    } catch (cheerioError) {
      logger.error(`[ExtractorService] Cheerio fallback failed for ${url}: ${cheerioError.message}`);
      return '';
    }
  }

  /**
   * General extract method for different source types
   * @param {string} sourceType - YOUTUBE, URL, ARTICLE, WEBPAGE, etc.
   * @param {string} sourceUrl - The URL of the source
   * @param {string} rawContent - The fallback raw content
   * @returns {Promise<string>} The extracted text or raw content
   */
  static async extract(sourceType, sourceUrl, rawContent = '') {
    try {
      const typeUpper = (sourceType || '').toUpperCase();
      if ((typeUpper === 'URL' || typeUpper === 'ARTICLE' || typeUpper === 'WEBPAGE' || typeUpper === 'YOUTUBE') && sourceUrl) {
        const text = await this.scrapeUrl(sourceUrl);
        return text || rawContent;
      }
      return rawContent;
    } catch (error) {
      logger.error(`[ExtractorService] Extraction failed for ${sourceType} (${sourceUrl}): ${error.message}`);
      return rawContent;
    }
  }
}
