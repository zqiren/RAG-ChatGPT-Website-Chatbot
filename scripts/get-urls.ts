import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const baseURL: string = 'https://www.ntu.edu.sg/scse/admissions/programmes/undergraduate-programmes';
let urls: Set<string> = new Set<string>();

const getURLs = async (url: string): Promise<void> => {
  try {
    const response = await axios.get(url);
    const $: cheerio.CheerioAPI = cheerio.load(response.data);

    $('a').each((_, link) => {
      const href: string | undefined = $(link).attr('href');
      if (href && href.startsWith('/') && !href.startsWith('/#')) {
        urls.add(new URL(href, baseURL).href);
      }
    });
  } catch (error: any) {
    console.error(`Error fetching ${url}: `, error.response?.status, error.message);
  }
};

const crawl = async (startURL: string): Promise<void> => {
  await getURLs(startURL);
};

crawl(baseURL).then(() => {
  const urlsArray: string[] = [...urls];
  console.log(urlsArray);
  if (urlsArray.length === 0) {
    console.log('No URLs found. Please check the website structure, network issues, or access restrictions.');
  } else {
    const output: string = `export const urls = ${JSON.stringify(urlsArray, null, 2)};`;
    writeFileSync('config/urls.ts', output);
    console.log('URLs have been saved to scripts/urls.ts');
  }
});
