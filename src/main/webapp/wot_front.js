var apiBaseURL = "http://localhost:8080/waslab02";
var apiTweetsEndpoint = apiBaseURL + "/tweets";

var httpRequest;
var tweetTemplate = "	<div id='tweet_{0}' class='tweetItem'>\n\
	<div class='likesSection'>\n\
	<span class='likesCount'>{1}</span><br /> <span\n\
	class='peopleLikeLabel'>people like this</span><br /> <br />\n\
	<button onclick='handle{5}(\"{0}\")'>{5}</button>\n\
	<br />\n\
	</div>\n\
	<div class='tweetContent'>\n\
	<h4>\n\
	<em>{2}</em> on {4}\n\
	</h4>\n\
	<p>{3}</p>\n\
	</div>\n\
	</div>\n";

String.prototype.templateFormat = function() {
	var args = arguments;
	return this.replace(/{(\d+)}/g, function(match, number) { 
		return typeof args[number] != 'undefined'
			? args[number]
		: match;
	});
};

function handleLike(tweetID) {
	var tweetElementId = 'tweet_' + tweetID;
	var likeEndpoint = apiTweetsEndpoint + "/" + tweetID + "/likes";
	// e.g., to like tweet #6, we call http://localhost:8080/waslab02/tweets/6/likes

	httpRequest = new XMLHttpRequest();
	httpRequest.open('POST', likeEndpoint, /*async*/true);
	httpRequest.onload = function() { 
		if (httpRequest.status == 200) { // 200 OK
			document.getElementById(tweetElementId).getElementsByClassName("likesCount")[0].innerHTML = httpRequest.responseText;
		}
	};
	httpRequest.send(null);  // no parameters needed
}

function handleDelete(tweetID) {
	/*
	 * TASK #4 
	 */	
	httpRequest = new XMLHttpRequest();
	httpRequest.open('DELETE', apiTweetsEndpoint + "/" + tweetID, /*async*/true);
	httpRequest.onload = function() { 
		if (httpRequest.status == 200) { // 200 OK
			// Corrección: eliminamos .element que estaba causando el error
			document.getElementById("tweet_" + tweetID).remove();
		}
	};
	httpRequest.send(null);  // no parameters needed
}

function generateTweetHTML(tweet, action) {  // action :== "Like" xor "Delete"
	var tweetDate = new Date(tweet.date);
	var formattedDate = tweetDate.toDateString() + " @ " + tweetDate.toLocaleTimeString();
	return tweetTemplate.templateFormat(tweet.id, tweet.likes, tweet.author, tweet.text, formattedDate, action);
}

function fetchTweets() {
	httpRequest = new XMLHttpRequest(); 
	httpRequest.open("GET", apiTweetsEndpoint, true); 
	httpRequest.onload = function() {
		if (httpRequest.status == 200) { // 200 OK
			var tweetData = httpRequest.responseText;
			/*
			 * TASK #2 -->
			 */
			var tweetList = JSON.parse(tweetData);
			var tweetHTML = "";
			tweetList.forEach(tweet =>{
				tweetHTML += generateTweetHTML(tweet, "Like");
			});
			document.getElementById("tweetList").innerHTML = tweetHTML;
		}
	};
	httpRequest.send(null); 
}

function submitTweet() {
	var authorInput = document.getElementById("tweetAuthor").value;
	var textInput = document.getElementById("tweetText").value;
	/*
	 * TASK #3 -->
	 */
	httpRequest = new XMLHttpRequest();
	httpRequest.open('POST', apiTweetsEndpoint, /*async*/true);
	httpRequest.onload = function() { 
		if (httpRequest.status == 200) { // 200 OK
			var newTweet = JSON.parse(httpRequest.responseText);
			var tweetHTML= generateTweetHTML(newTweet, "Delete");
			document.getElementById("tweetList").insertAdjacentHTML("afterbegin", tweetHTML);

		}
	};
	httpRequest.setRequestHeader("Content-Type", "application/json");
	httpRequest.send(JSON.stringify({author : authorInput,
		 text : textInput}));  // no parameters needed

	// Clear form fields
	document.getElementById("tweetAuthor").value = "";
	document.getElementById("tweetText").value = "";
}

// Main function
function initializeApp() {
	document.getElementById("tweetSubmit").onclick = submitTweet;
	fetchTweets();
};
