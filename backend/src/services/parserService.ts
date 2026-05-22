import cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// 1. WEB SCRAPER: Extract text from blog post, news page, or documentation URL
export const scrapeUrl = async (url: string): Promise<{ title: string; content: string }> => {
  try {
    // Add simple headers to prevent request blocking
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL. Server responded with status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract Title
    let title = $('title').text().trim() || 'Scraped Article';
    if ($('h1').length > 0) {
      title = $('h1').first().text().trim();
    }

    // Clean up unwanted tags before extracting text
    $('script, style, nav, footer, header, iframe, noscript, .ads, #comments, .comments, .sidebar').remove();

    // Select article/body paragraphs
    let paragraphs: string[] = [];
    
    // Try standard article containers first
    const articleContainers = $('article, [role="main"], .post-content, .entry-content, .article-content, #article-body');
    if (articleContainers.length > 0) {
      articleContainers.find('p, h2, h3, li').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 15) {
          paragraphs.push(text);
        }
      });
    }

    // Fallback: If no article containers found, extract from general body paragraphs
    if (paragraphs.length === 0) {
      $('p, h2, h3, li').each((_, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 15) {
          paragraphs.push(text);
        }
      });
    }

    // Joint content
    const content = paragraphs.join('\n\n');

    if (!content || content.length < 50) {
      throw new Error('Could not extract sufficient text from the provided web page. The page might be protected or fully client-side rendered.');
    }

    return { title, content };
  } catch (error: any) {
    console.error('URL Scraping Error:', error);
    throw new Error(error.message || 'Failed to scrape content from the provided website URL.');
  }
};


// 2. PDF PARSER: Extract text from file buffer
export const parsePdfBuffer = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);
    const parsedText = data.text.trim();

    if (!parsedText || parsedText.length < 10) {
      throw new Error('PDF file appears to be empty or contains scanned images without OCR text.');
    }

    return parsedText;
  } catch (error: any) {
    console.error('PDF Parsing Error:', error);
    throw new Error(error.message || 'Failed to extract text from the uploaded PDF document.');
  }
};


// 3. DOCX PARSER: Extract text from Word document buffer
export const parseDocxBuffer = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const parsedText = result.value.trim();

    if (!parsedText || parsedText.length < 10) {
      throw new Error('Word DOCX file appears to be empty or unreadable.');
    }

    return parsedText;
  } catch (error: any) {
    console.error('Word Document Parsing Error:', error);
    throw new Error(error.message || 'Failed to extract text from the uploaded DOCX document.');
  }
};
