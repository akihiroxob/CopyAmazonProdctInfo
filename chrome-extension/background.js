// background.js

// Create a context menu item
chrome.contextMenus.create({
    id: 'copy-product-info',
    title: '商品をコピー',
    contexts: ['all'],
    documentUrlPatterns: ['https://www.amazon.co.jp/*'],
});

// Function to run in the context of the page to get product information,
// format it as a table row with columns: title, author, url, bulletPoints, comments,
// and copy the result to the clipboard.
function getProductInfo() {
    function shortenAmazonUrl(url) {
        const match = url.match(/\/dp\/([A-Z0-9]{10})/);
        if (match) {
            return `https://www.amazon.co.jp/dp/${match[1]}`;
        } else {
            throw new Error('ASINが見つかりませんでした。');
        }
    }

    function sunitize(text) {
        return text
            .replace(/<[^>]*>/g, '')
            .replace(/\n/g, ' ')
            .trim();
    }

    function mergeComments(elements) {
        const mergedText = [];
        elements.forEach((element) => {
            const text = sunitize(element.innerText);
            if (text) mergedText.push(text);
        });
        return mergedText.join('|');
    }

    try {
        const titleElement = document.querySelector('#productTitle');
        const authorElement = document.querySelector('#bylineInfo');
        const bulletPointsElement = document.querySelector('#feature-bullets, #bookDescription_feature_div');
        const commentsElements = document.querySelectorAll('.a-row.a-spacing-small.review-data');
        console.log(commentsElements);

        const title = titleElement ? sunitize(titleElement.innerText) : '';
        const author = authorElement ? sunitize(authorElement.innerText) : '';
        const url = shortenAmazonUrl(window.location.href);
        const bulletPoints = bulletPointsElement ? sunitize(bulletPointsElement.innerText) : '';
        const comments = commentsElements ? mergeComments(commentsElements) : '';

        // Format as a table row (tab-delimited)
        const tableRow = [title, author, url, bulletPoints, comments].join('\t');
        // Copy the table row to the clipboard
        navigator.clipboard
            .writeText(tableRow)
            .then(console.log('Copied to clipboard:', tableRow))
            .catch((err) => console.error('Error copying to clipboard:', err));
    } catch (error) {
        console.error('Error in getProductInfo:', error);
    }
}

// Add click event listener for the context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'copy-product-info' && tab && tab.id) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: getProductInfo,
        });
    }
});
