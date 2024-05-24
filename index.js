require('dotenv').config();
const puppeteer = require('puppeteer');

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
  // Add more user agents as needed
];

async function setUserAgent(page) {
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  await page.setUserAgent(userAgent);
}

async function extractNumericValue(text) {
  // Extract numbers using a regular expression
  const numericValue = text.match(/\d+/g).join('');
  return parseInt(numericValue, 10);
}

function delay(time) {
  return new Promise(function(resolve) { 
    setTimeout(resolve, time)
  });
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await setUserAgent(page);
    await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });

    console.log('Typing email...');
    await page.type('#email', process.env.FB_EMAIL, { delay: getRandomDelay(30, 100) });

    console.log('Typing password...');
    await page.type('#pass', process.env.FB_PASSWORD, { delay: getRandomDelay(30, 100) });

    console.log('Waiting before clicking login...');
    await delay(getRandomDelay(1000, 3000)); // Random delay before clicking login

    console.log('Clicking login button...');
    await page.click('[name="login"]');

    console.log('Waiting for navigation...');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Navigate to the specific Facebook group
    const groupUrl = 'https://www.facebook.com/groups/126966114029232/members'; // Replace with your group's URL
    await page.goto(groupUrl, { waitUntil: 'networkidle2' });

    console.log('Navigating to group page...');
    await page.waitForSelector('div.xu06os2.x1ok221b h2 span span span strong', { visible: true });

    // Extract member count
    const memberCountText = await page.evaluate(() => {
      const element = document.querySelector('div.xu06os2.x1ok221b h2 span span span strong');
      return element ? element.textContent.trim() : null;
    });

    if (memberCountText) {
      const numericMemberCount = await extractNumericValue(memberCountText);
      console.log(`Member count: ${numericMemberCount}`);
    } else {
      console.log('Member count not found.');
    }

    await browser.close();
    console.log('Process completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
})();
