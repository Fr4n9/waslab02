package fib.asw.waslab02;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet(urlPatterns = {"/tweets", "/tweets/*"})
public class WoTServlet extends HttpServlet {

	private static final long serialVersionUID = 1L;
	
	private TweetDAO tweetRepository;
	private String BASE_TWEETS_URI = "/waslab02/tweets/";

    public void init() {
    	tweetRepository = new TweetDAO((java.sql.Connection) this.getServletContext().getAttribute("connection"));
    }

    @Override
	// Implements GET http://localhost:8080/waslab02/tweets
	public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    	response.setContentType("application/json");
		response.setHeader("Cache-control", "no-cache");
		List<Tweet> allTweets = tweetRepository.getAllTweets();
		JSONArray jsonResponse = new JSONArray();
		for (Tweet tweet: allTweets) {
			JSONObject jsonTweet = new JSONObject(tweet);
			jsonTweet.remove("class");
			jsonResponse.put(jsonTweet);
		}
		response.getWriter().println(jsonResponse.toString());

    }

    @Override
	// Implements POST http://localhost:8080/waslab02/tweets/:id/likes
	//        and POST http://localhost:8080/waslab02/tweets
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		String requestUri = request.getRequestURI();
		int likesIndex = requestUri.lastIndexOf("/likes");
		if (likesIndex > -1) {  // uri ends with "/likes"
			// Implements POST http://localhost:8080/waslab02/tweets/:id/likes
			long tweetId = Long.valueOf(requestUri.substring(BASE_TWEETS_URI.length(), likesIndex));		
			response.setContentType("text/plain");
			response.getWriter().println(tweetRepository.likeTweet(tweetId));
		}
		else { 
			// Implements POST http://localhost:8080/waslab02/tweets
			int contentLength = request.getContentLength();
			byte[] requestBodyData = new byte[contentLength];
			ServletInputStream inputStream = request.getInputStream();
			inputStream.readLine(requestBodyData, 0, contentLength);
			String requestBody = new String(requestBodyData);
			/*      ^
		      The String variable requestBody contains the sent (JSON) Data. 
		      Complete the implementation below.*/
			JSONObject json = new JSONObject(requestBody);
			String author = json.getString("author");
			String text = json.getString("text");
			Tweet tweet= tweetRepository.insertTweet(author, text);
			//JSONObject json2 = new JSONObject(tweet);
			JSONObject json2 = new JSONObject(tweet);

			response.getWriter().println(json2.toString());

			
		}
	}
    
    @Override
	// Implements DELETE http://localhost:8080/waslab02/tweets/:id
	public void doDelete(HttpServletRequest req, HttpServletResponse resp)
			throws IOException, ServletException {
    	
    	String requestUri = req.getRequestURI();
    	String tweetIdString = requestUri.substring(BASE_TWEETS_URI.length()); 
    	long tweetId = Long.parseLong(tweetIdString);
		
		if(!tweetRepository.deleteTweet(tweetId)) throw new ServletException("No va");

		//throw new ServletException("DELETE not yet implemented");
	}
}
