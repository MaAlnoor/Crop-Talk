const puppeteer = require("puppeteer");
const fs = require('fs');

async function scrapeProduct(url) {
    const browser = await puppeteer.launch({
        defaultViewport: {width: 1920, height: 1080}
    });
    const page = await browser.newPage();
    
    await page.goto(url, {waitUntil: 'networkidle0'});
    
    // Wait for the specific element to be fully loaded
    await page.waitForSelector('#futures-feed-Target', {visible: true});
    
    // Use page.evaluate to wait a bit more for dynamic content
    await page.evaluate(() => {
        return new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });
    });
    
    // Extract data from all tables within the futures-feed-Target element
    const tableData = await page.evaluate(() => {
        const container = document.querySelector('#futures-feed-Target');
        if (!container) return [];
        
        const tables = container.querySelectorAll('table');
        const allTablesData = [];
        
        tables.forEach((table, tableIndex) => {
            const tableObj = {
                tableIndex,
                title: '',
                headers: [],
                rows: []
            };
            
            // Try to find a title for this table (usually in a preceding h2, h3, etc.)
            let prevElement = table.previousElementSibling;
            while (prevElement) {
                if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(prevElement.tagName)) {
                    tableObj.title = prevElement.textContent.trim();
                    break;
                }
                prevElement = prevElement.previousElementSibling;
            }
            
            // Get headers
            const headerRow = table.querySelector('thead tr');
            if (headerRow) {
                const headers = Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent.trim());
                tableObj.headers = headers;
            }
            
            // Get rows
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim());
                tableObj.rows.push(cells);
            });
            
            allTablesData.push(tableObj);
        });
        
        return allTablesData;
    });
    
    // Save the extracted data to a JSON file
    fs.writeFileSync('futures-feed-data.json', JSON.stringify(tableData, null, 2));
    
    // Also create a more readable text version
    let textOutput = '';
    tableData.forEach(table => {
        textOutput += `Table: ${table.title || 'Untitled Table'}\n\n`;
        
        if (table.headers.length > 0) {
            textOutput += table.headers.join(' | ') + '\n';
            textOutput += table.headers.map(() => '---').join(' | ') + '\n';
        }
        
        table.rows.forEach(row => {
            textOutput += row.join(' | ') + '\n';
        });
        
        textOutput += '\n\n';
    });
    
    fs.writeFileSync('futures-feed-data.txt', textOutput);
    
    console.log(`Data extracted from ${tableData.length} tables and saved to futures-feed-data.json and futures-feed-data.txt`);
    
    await browser.close();
}

scrapeProduct("https://ahdb.org.uk/cereals-oilseeds-markets");