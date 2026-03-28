const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
  const url = "https://yle.fi/plus/abitreenit/2023/kevat/2023-03-22_M_fi/index.html";
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    // YLE uses various sections for sections of the test.
    // Let's print out the first few questions and see how they are structured.
    console.log("Page Title:", $('title').text());
    
    // Usually Abitti exam questions are grouped by <section> or have IDs like #1, #2, etc.
    const questions = [];
    $('[id]').each((i, el) => {
       const id = $(el).attr('id');
       // If it looks like a number
       if (/^\d+$/.test(id)) {
           questions.push({
               id,
               htmlLen: $(el).html().length,
               textPreview: $(el).text().substring(0, 50).trim().replace(/\s+/g, ' ')
           });
       }
    });

    const q3 = $('#3');
    console.log("Q3 text preview:", q3.text().substring(0, 100).replace(/\s+/g, ' '));
    console.log("Q3 HTML:", q3.html().substring(0, 600));

    // Try finding model answers inside q3
    console.log("Q3 child classes:", q3.find('*').map((i, el) => $(el).attr('class')).get().filter(Boolean).slice(0, 15).join(', '));
    
  } catch (error) {
    console.error("Fetch failed", error.message);
  }
}

testScrape();
