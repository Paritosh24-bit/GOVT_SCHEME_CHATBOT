import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Scheme {
  title: string;
  description: string;
  url: string;
}

export async function scrapeGovernmentSchemes(): Promise<Scheme[]> {
  try {
    // We'll scrape the main schemes page or a search result
    const url = 'https://www.india.gov.in/my-government/schemes';
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const schemes: Scheme[] = [];

    // The structure of india.gov.in schemes page
    $('.views-row').each((_, element) => {
      const title = $(element).find('h3').text().trim();
      const description = $(element).find('.views-field-field-short-description').text().trim() || 
                          $(element).find('p').text().trim();
      const link = $(element).find('a').attr('href');

      if (title && description) {
        schemes.push({
          title,
          description,
          url: link ? (link.startsWith('http') ? link : `https://www.india.gov.in${link}`) : ''
        });
      }
    });

    // Fallback if the specific selectors fail (sites change)
    if (schemes.length === 0) {
      $('a').each((_, element) => {
        const text = $(element).text().trim();
        if (text.toLowerCase().includes('scheme') || text.toLowerCase().includes('yojana')) {
          schemes.push({
            title: text,
            description: 'Government scheme information',
            url: $(element).attr('href') || ''
          });
        }
      });
    }

    return schemes.slice(0, 20); // Limit for demo
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  }
}
