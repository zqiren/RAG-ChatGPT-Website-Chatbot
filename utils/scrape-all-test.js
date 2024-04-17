import axios from 'axios';
import * as cheerio from 'cheerio';

// Replace with the URL of the website you want to scrape
const url = 'https://www.ntu.edu.sg/education/undergraduate-programme/bachelor-of-science-hons-in-artificial-intelligence-and-society#unique';

    // axios.get(url)
    // .then(response => {
    //     const html = response.data;
    //     const $ = cheerio.load(html);
    //     const mainContentText = $('.main-content') // Directly target elements with the 'main-content' class
    //     .map((i, el) => {
    //         // Get the combined text of all children elements, but not any nested elements within
    //         return $(el).clone()    // Clone the element
    //         .children()           // Select all the children
    //         .remove()             // Remove all the children
    //         .end()                // End the chain to go back to the selected element
    //         .text()               // Get the text of it
    //         .trim();              // Trim whitespace
    //     })
    //     .get() // Convert Cheerio object to an array
    //     .filter(text => text.length > 0) // Filter out empty strings
    //     .join(' '); // Join all non-empty texts into a single string

    //     console.log(mainContentText);
    // })
    // .catch(console.error);


    axios.get(url)
    .then(response => {
      const html = response.data;
      const $ = cheerio.load(html);
      const rawContentText = $('.main-content') // Directly target elements with the 'main-content' class
        .text(); // Get the combined text content of all matched elements
    
      const title = $('h1.detail-header__title').text();

      // Remove line breaks, carriage returns, tab spaces, and excessive whitespace
      const content = $('.main-content').text();

      const cleanedContent = content.replace(/\s+/g, ' ').trim();
  
      const contentLength = cleanedContent?.match(/\b\w+\b/g)?.length ?? 0;
  
      console.log(cleanedContent);
    })
    .catch(console.error);