const http = require('http');
const https = require('https');

class TimeScraper {
    constructor() {
        this.url = 'https://time.com';
    }

    getHTML() {
        return new Promise((resolve, reject) => {
            https.get(this.url, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
                res.on('error', err => reject(err));
            });
        });
    }

    cleanText(text) {
        return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    }

    getHref(linkTag) {
        const match = linkTag.match(/href=["']([^"']+)["']/);
        return match ? match[1] : '';
    }

    fixURL(link) {
        if (link.startsWith('http')) return link;
        if (link.startsWith('/')) return this.url + link;
        return link;
    }

    alreadyExists(stories, newStory) {
        return stories.find(s => s.title === newStory.title || s.link === newStory.link);
    }

    extractStories(html) {
        let stories = [];
        
        let pos = 0;
        while (pos < html.length && stories.length < 8) {
            let start = html.indexOf('<article', pos);
            if (start === -1) break;
            
            let end = html.indexOf('</article>', start);
            if (end === -1) break;
            
            let articleHTML = html.substring(start, end);
            
            let linkStart = 0;
            while (linkStart < articleHTML.length) {
                let aStart = articleHTML.indexOf('<a ', linkStart);
                if (aStart === -1) break;
                
                let aEnd = articleHTML.indexOf('</a>', aStart);
                if (aEnd === -1) break;
                
                let linkHTML = articleHTML.substring(aStart, aEnd + 4);
                let href = this.getHref(linkHTML);
                let text = this.cleanText(linkHTML);
                
                if (href && text && text.length > 15 && text.length < 150) {
                    if (href.includes('time.com') || href.startsWith('/')) {
                        let story = {
                            title: text,
                            link: this.fixURL(href)
                        };
                        
                        if (!this.alreadyExists(stories, story)) {
                            stories.push(story);
                        }
                    }
                }
                
                linkStart = aEnd + 4;
            }
            
            pos = end + 10;
        }

        let patterns = [
            /<h1[^>]*>.*?<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>.*?<\/h1>/g,
            /<h2[^>]*>.*?<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>.*?<\/h2>/g,
            /<h3[^>]*>.*?<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>.*?<\/h3>/g
        ];

        for (let pattern of patterns) {
            let match;
            while ((match = pattern.exec(html)) && stories.length < 8) {
                let href = match[1];
                let title = this.cleanText(match[2]);
                
                if (title.length > 15 && (href.includes('time.com') || href.startsWith('/'))) {
                    let story = {
                        title: title,
                        link: this.fixURL(href)
                    };
                    
                    if (!this.alreadyExists(stories, story)) {
                        stories.push(story);
                    }
                }
            }
        }

        stories = stories.filter(story => {
            if (!story.title || !story.link) return false;
            if (story.title.length < 15 || story.title.length > 120) return false;
            if (!story.link.includes('time.com')) return false;
            
            let title = story.title.toLowerCase();
            if (title.includes('subscribe') || title.includes('newsletter')) return false;
            
            return true;
        });

        return stories.slice(0, 6);
    }

    async getStories() {
        try {
            let html = await this.getHTML();
            let stories = this.extractStories(html);
            return stories;
        } catch (error) {
            throw new Error('Failed to get stories: ' + error.message);
        }
    }
}

function startServer() {
    let scraper = new TimeScraper();
    
    let server = http.createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        
        if (req.method === 'GET' && req.url === '/getTimeStories') {
            try {
                console.log('Getting stories from time.com...');
                let stories = await scraper.getStories();
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(stories, null, 2));
                
                console.log(`Sent ${stories.length} stories`);
            } catch (error) {
                console.log('Error:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Could not fetch stories' }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Use GET /getTimeStories' }));
        }
    });
    
    return server;
}

let PORT = 3000;
let server = startServer();

server.listen(PORT, () => {
    console.log('Time.com Scraper Started');
    console.log('Server: http://localhost:' + PORT);
    console.log('API: http://localhost:' + PORT + '/getTimeStories');
});

process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close();
    process.exit();
});

module.exports = TimeScraper;
