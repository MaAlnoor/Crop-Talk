const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function scrapeAmazonProducts() {
  console.log('Starting Amazon scraper...');
  
  // Create images directory if it doesn't exist
  const imagesDir = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to appear more like a regular browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36');
    
    // Navigate to Amazon search page
    console.log('Navigating to Amazon...');
    await page.goto('https://www.amazon.co.uk/s?k=farming+tools+and+equipment&crid=UOTL07E9QBTR&sprefix=farming+tools%2Caps%2C85&ref=nb_sb_ss_ts-doa-p_2_13', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Handle cookie popup if it appears
    console.log('Checking for cookie popup...');
    try {
      // Wait for cookie popup to appear (with a short timeout)
      await page.waitForSelector('#sp-cc-accept, .a-button-input[data-action="a-accept-cookies"]', { 
        timeout: 5000 
      });
      
      console.log('Cookie popup detected, accepting cookies...');
      
      // Click the accept cookies button
      await page.click('#sp-cc-accept, .a-button-input[data-action="a-accept-cookies"]');
      
      // Wait for the popup to disappear
      await page.waitForTimeout(1000);
      
      console.log('Cookies accepted');
    } catch (error) {
      console.log('No cookie popup detected or unable to handle it:', error.message);
    }
    
    console.log('Page loaded, extracting product data...');
    
    // Extract product data
    const products = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.s-result-item[data-component-type="s-search-result"]'));
      
      return items.slice(0, 10).map((item, index) => {
        // Get product title
        const titleElement = item.querySelector('h2 .a-link-normal');
        const title = titleElement ? titleElement.textContent.trim() : 'No title available';
        
        // Get product price
        const priceElement = item.querySelector('.a-price .a-offscreen');
        const price = priceElement ? priceElement.textContent.trim() : 'Price not available';
        
        // Get product rating
        const ratingElement = item.querySelector('.a-icon-star-small .a-icon-alt');
        const rating = ratingElement ? ratingElement.textContent.trim() : 'No rating available';
        
        // Get product link
        const linkElement = item.querySelector('h2 .a-link-normal');
        const link = linkElement ? linkElement.getAttribute('href') : '#';
        
        // Get product image URL
        const imageElement = item.querySelector('.s-image');
        const imageUrl = imageElement ? imageElement.getAttribute('src') : '';
        
        // Get product description
        const descElement = item.querySelector('.a-size-base-plus');
        const description = descElement ? descElement.textContent.trim() : '';
        
        return {
          id: index,
          title,
          price,
          rating,
          description,
          link: link.startsWith('/') ? `https://www.amazon.co.uk${link}` : link,
          imageUrl
        };
      });
    });
    
    console.log(`Found ${products.length} products`);
    
    // Download images for each product
    const downloadPromises = products.map((product, index) => {
      return new Promise((resolve, reject) => {
        if (!product.imageUrl) {
          console.log(`No image URL for product ${index + 1}`);
          product.localImagePath = '';
          return resolve();
        }
        
        const imagePath = path.join(imagesDir, `product_${index}.jpg`);
        const file = fs.createWriteStream(imagePath);
        
        console.log(`Downloading image for product ${index + 1}...`);
        
        https.get(product.imageUrl, response => {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            product.localImagePath = `images/product_${index}.jpg`;
            console.log(`Image saved to ${imagePath}`);
            resolve();
          });
        }).on('error', err => {
          fs.unlink(imagePath, () => {}); // Delete the file if there's an error
          console.error(`Error downloading image for product ${index + 1}:`, err.message);
          product.localImagePath = '';
          resolve(); // Resolve anyway to continue with other products
        });
      });
    });
    
    // Wait for all images to download
    await Promise.all(downloadPromises);
    
    // Save product data to JSON file
    const dataPath = path.join(__dirname, 'product-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(products, null, 2));
    
    console.log('Scraping completed successfully!');
    return products;
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeAmazonProducts()
  .then(() => console.log('Scraping completed'))
  .catch(err => console.error('Scraping failed:', err));
