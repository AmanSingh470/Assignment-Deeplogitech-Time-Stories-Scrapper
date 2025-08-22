# Assignment-Deeplogitech-Time-Stories-Scrapper
This project implements a simple Node.js HTTP service that scrapes the latest 6 stories from Time.com  and returns them as a JSON API.

## **What it Does**

This project creates a REST API that scrapes the Time.com homepage and returns the most recent 6 news stories in JSON format.  

---

## **How to Run**

1. **Clone this repository**
   ```bash
   git clone <your-repo-link>
   cd time-com-scraper
   ```

2. **Run the server**
   ```bash
   node server.js
   ```

3. **Access the API**
   Open your browser and go to:
   ```
   http://localhost:3000/getTimeStories
   ```

---

## **API Usage**

- **Endpoint:** `GET /getTimeStories`

- **Response:**
   ```json
   [
     {
       "title": "Story title here",
       "link": "https://time.com/story-link/"
     },
     {
       "title": "Another story title",
       "link": "https://time.com/another-link/"
     }
   ]
   ```

The response always contains exactly **6 stories**.

---

## **Testing**

Run the following command in your terminal:
```bash
curl http://localhost:3000/getTimeStories
```
Or simply open the URL in your browser.

---

## **How it Works**

1. Fetches HTML from **Time.com** using the built-in `http/https` modules
2. Searches for `<article>` tags and headline patterns
3. Extracts story titles and links using basic string matching
4. Returns exactly **6 stories** as JSON

---

## **Technical Details**

- **Language:** JavaScript (Node.js)  
- **Libraries:** None (only built-in modules)  
- **Method:** Basic HTML parsing with regex and string manipulation  
- **Port:** 3000 (default)

---

## **Example Output**

### Server Log
<img width="600" alt="server log" src="https://github.com/user-attachments/assets/413c48a7-8ab0-4fd2-bfa5-d3ed10da3656" />

### JSON Response
<img width="700" alt="json response" src="https://github.com/user-attachments/assets/413c48a7-8ab0-4fd2-bfa5-d3ed10da3656"/>


