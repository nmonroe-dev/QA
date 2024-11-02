const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // Launch the browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  let totalArticles = [];

  // Collect 100 articles
  while (totalArticles.length < 100) {
    const post = await page.$$eval(".athing", nodes =>
      nodes.map(node => {
        const id = node.id;
        const titleline = node.querySelector(".titleline a");
        const age = node.nextElementSibling.querySelector(".age a");

        const title = titleline ? titleline.innerText : "No title";
        const timeMin = age ? age.innerText : "0 minutes";

        // Time convert to minutes
        let min = 0;
        if (timeMin.includes('minute')) {
          min = Number(timeMin.split(" ")[0]);
        } else if (timeMin.includes('hour')) {
          min = Number(timeMin.split(' ')[0]) * 60;
        } else if (timeMin.includes('day')) {
          min = Number(timeMin.split(" ")[0]) * 1440; 
        }

        return { id, title, min };
      })
    );

    // Combine Articles 
    totalArticles = totalArticles.concat(post);

    // Load next page
    if (totalArticles.length < 100) {
      await page.click('a.morelink');
    }
  }

  // Exactly 100 articles
  totalArticles = totalArticles.slice(0, 100);

  // Check if sorted by newest to oldest
  let sorted = true;
  for (let i = 1; i < totalArticles.length; i++) {
    if (totalArticles[i].min < totalArticles[i - 1].min) {
      sorted = false;
      break; 
    }
  }

  if (sorted) {
    console.log('Validation Passed: Posts are sorted from newest to oldest by timestamp.');
  } else {
    console.log('Validation Failed: Posts are not sorted correctly by timestamp.');
  }

  console.table(totalArticles);

  // Close the browser
  await browser.close();
}

// Run the function
(async () => {
  await sortHackerNewsArticles();
})();
