document.addEventListener("DOMContentLoaded", () => {
    const userDisplay = document.getElementById('user-display');
    const currentUser = localStorage.getItem("currentUser");
    
    if (currentUser && userDisplay) {
        userDisplay.textContent = `${currentUser}`;
        userDisplay.classList.add('logged-in');
    } else if (userDisplay) {
        userDisplay.textContent = 'Not logged in';
    }
    
    let currentPosts = [];
    let currentReplies = [];

    //David Code -farm AI 
    const farmAIButton = document.getElementById("farm-ai-btn");
    const farmAIInput = document.getElementById("farm-ai-input");
    const farmAIResponseDiv = document.getElementById("farm-ai-response");

    if(farmAIButton){
        farmAIButton.addEventListener("click", async () => { 
            const question = farmAIInput.value.trim();
            if (!question){
                farmAIResponseDiv.textContent = "Please enter a question.";
                return;
            }
            try{
                const response = await fetch("http://localhost:3000/farmAI",{
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body:JSON.stringify({ question }),
                });
                const data = await response.json();
                farmAIResponseDiv.textContent = data.answer || "Sorry, I could not find an answer.";

            }catch (error){
                console.error("Error:", error);
                farmAIResponseDiv.textContent = "An error occured. Please try again.";
            }
        });
    }
    const submitBtn = document.querySelector(".btn");

    if (submitBtn) {
        submitBtn.addEventListener("click", () => {
            alert("Form submitted!");
        });
    }

    const postButton = document.getElementById("submit-post");
    const postContent = document.getElementById("post-content");
    const postsSection = document.querySelector(".posts");
    
    // Store user votes
    const userVotes = new Map();
        
    async function fetchAndDisplayPosts() {
        try {
            const postsResponse = await fetch('http://localhost:3000/posts');
            if (!postsResponse.ok) {
                console.error('Failed to fetch posts:', postsResponse.statusText);
                return;
            }
            currentPosts = await postsResponse.json();
            
            const repliesResponse = await fetch('http://localhost:3000/replies');
            if (!repliesResponse.ok) {
                console.error('Failed to fetch replies:', repliesResponse.statusText);
                return;
            }
            currentReplies = await repliesResponse.json();
            
            // Default sort (most recent first)
            sortPosts('recent');
        } catch (error) {
            console.error('Error fetching posts or replies:', error);
        }
    }

    function sortPosts(sortType) {
        let sortedPosts = [...currentPosts]; // Create a copy of the array
        
        switch(sortType) {
            case 'popular':
                // Sort by net votes (upvotes - downvotes)
                sortedPosts.sort((a, b) => {
                    const netA = (a.upvotes || 0) - (a.downvotes || 0);
                    const netB = (b.upvotes || 0) - (b.downvotes || 0);
                    return netB - netA; // Highest net votes first
                });
                break;
            case 'recent':
                // Simply reverse the array to show newest first
                sortedPosts.reverse();
                break;
            default:
                // Default behavior (could also reverse here if you want)
                break;
        }
        
        displayPosts(sortedPosts, currentReplies);
    }

    // Function to display posts
    function displayPosts(posts, replies) {
        postsSection.innerHTML = ""; // Clear existing posts
    
        posts.forEach(post => {
            const newPost = document.createElement("div");
            newPost.classList.add("post");
            newPost.dataset.postId = post._id || generateUniqueId(); // Use database ID or generate one
    
            // Create paragraph element for text content
            const postText = document.createElement("p");
            postText.textContent = post.question; // Use the 'question' field from the database
    
            // Create elements for username and date
            const postUserAndDate = document.createElement("p");
            postUserAndDate.textContent = `Posted by '${post.username}' on ${post.date}`;
            postUserAndDate.classList.add("post-user-and-date");
    
            // Create elements for votes and reports
            const postUpvotes = document.createElement("p");
            postUpvotes.textContent = `Upvotes: ${post.upvotes}`;
            postUpvotes.classList.add("post-upvotes");
    
            const postDownvotes = document.createElement("p");
            postDownvotes.textContent = `Downvotes: ${post.downvotes}`;
            postDownvotes.classList.add("post-downvotes");
    
            const postReports = document.createElement("p");
            postReports.textContent = `Reports: ${post.reports}`;
            postReports.classList.add("post-reports");
    
            // Create Upvote, Downvote, and Reply buttons
            const upvoteButton = createVoteButton("👍", "upvote-btn", post.upvotes);
            const downvoteButton = createVoteButton("👎", "downvote-btn", post.downvotes);
            const replyButton = document.createElement("button");
            replyButton.textContent = "Reply";
            replyButton.classList.add("reply-btn");
    
            // Create replies container
            const repliesDiv = document.createElement("div");
            repliesDiv.classList.add("replies");
    
            // Append elements
            newPost.appendChild(postText);
            newPost.appendChild(postUserAndDate);
            newPost.appendChild(upvoteButton);
            newPost.appendChild(downvoteButton);
            newPost.appendChild(replyButton);
            newPost.appendChild(repliesDiv);
    
            // Append the new post to the posts section
            postsSection.appendChild(newPost);
    
            // Display replies under their corresponding question
            const postReplies = replies.filter(reply => reply.question === post.question);
            postReplies.forEach(reply => {
                const replyDiv = document.createElement("div");
                replyDiv.classList.add("reply");
                replyDiv.dataset.postId = reply._id; 
    
                // Reply content
                const replyContent = document.createElement("p");
                replyContent.textContent = reply.answer;
    
                // Reply metadata (username and date)
                const replyUserAndDate = document.createElement("p");
                replyUserAndDate.textContent = `Replied by '${reply.username}' on ${reply.date}`;
                replyUserAndDate.classList.add("reply-user-and-date");
    
                // Reply upvote and downvote buttons
                const replyUpvoteButton = createVoteButton("👍", "upvote-btn", reply.upvotes);
                const replyDownvoteButton = createVoteButton("👎", "downvote-btn", reply.downvotes);
    
                // Append elements to the reply
                replyDiv.appendChild(replyContent);
                replyDiv.appendChild(replyUserAndDate);
                replyDiv.appendChild(replyUpvoteButton);
                replyDiv.appendChild(replyDownvoteButton);
    
                // Append the reply to the replies container
                repliesDiv.appendChild(replyDiv);
            });
        });
    }

    // Fetch and display posts when the page loads
    fetchAndDisplayPosts();

    const popularBtn = document.getElementById('popular-btn');
    const recentBtn = document.getElementById('recent-btn');
    const defaultBtn = document.getElementById('default-btn');
    
    if (popularBtn) {
        popularBtn.addEventListener('click', () => sortPosts('popular'));
    }
    
    if (recentBtn) {
        recentBtn.addEventListener('click', () => sortPosts('recent'));
    }
    
    if (defaultBtn) {
        defaultBtn.addEventListener('click', () => sortPosts('default'));
    }

    if (postButton) {
        postButton.addEventListener("click", async function(e) {
            e.preventDefault(); // Prevents unintended form submission if inside a form
            const content = postContent.value.trim();
            let currentUser = localStorage.getItem("currentUser");

            if (content === "") {
                alert("Post cannot be empty!");
                return;
            }

            const postData = {
                type: "post",
                username: currentUser,
                question: content,
                upvotes: 0,
                downvotes: 0,
                reports: 0,
                date: new Date().toLocaleDateString("en-GB")
            };

            try {
                const response = await fetch("http://localhost:3000/postpage", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postData)
                });

                if (response.ok) {
                    alert("Post submitted successfully!");
                    postContent.value = ""; // Clear input field
                } else {
                    const errorText = await response.text();
                    alert(`Failed to submit post: ${errorText}`);
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred while submitting the post.");
            }

            // Clear input field
            postContent.value = "";
        });
    }

    // Event delegation for handling replies and votes
    postsSection.addEventListener("click", async (event) => {
        if (event.target.classList.contains("reply-btn")) {
            const parentPost = event.target.closest(".post, .reply");
            let replyInput = parentPost.querySelector(".reply-input");

            // If reply input doesn't exist, create one
            if (!replyInput) {
                replyInput = document.createElement("input");
                replyInput.classList.add("reply-input");
                replyInput.placeholder = "Write a reply...";

                const submitReplyBtn = document.createElement("button");
                submitReplyBtn.textContent = "Submit Reply";
                submitReplyBtn.classList.add("submit-reply-btn");

                parentPost.appendChild(replyInput);
                parentPost.appendChild(submitReplyBtn);
            }
        }

        if (event.target.classList.contains("submit-reply-btn")) {
            const parentPost = event.target.closest(".post, .reply");
            const replyInput = parentPost.querySelector(".reply-input");
            let currentUser = localStorage.getItem("currentUser");
    
            if (replyInput && replyInput.value.trim() !== "") {
                // Get the question from the post being replied to
                const question = parentPost.querySelector("p").textContent;
    
                const replyData = {
                    type: "reply",
                    username: currentUser,
                    question: question, // Add the question field
                    answer: replyInput.value.trim(),
                    upvotes: 0,
                    downvotes: 0,
                    reports: 0,
                    date: new Date().toLocaleDateString("en-GB")
                };
    
                try {
                    const response = await fetch("http://localhost:3000/reply", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(replyData)
                    });
    
                    if (response.ok) {
                        alert("Reply submitted successfully!");
                        replyInput.value = ""; // Clear input field
                        fetchAndDisplayPosts(); // Refresh posts to show the new reply
                    } else {
                        const errorText = await response.text();
                        alert(`Failed to submit reply: ${errorText}`);
                    }
                } catch (error) {
                    console.error("Error:", error);
                    alert("An error occurred while submitting the reply.");
                }
            } else {
                alert("Reply cannot be empty!");
            }
        }


        

        if (event.target.classList.contains("upvote-btn") || event.target.classList.contains("downvote-btn")) {
            const parentItem = event.target.closest(".post, .reply");
            const itemId = parentItem.dataset.postId; // This should be the MongoDB _id
            const isUpvote = event.target.classList.contains("upvote-btn");
            const isReply = parentItem.classList.contains("reply"); // Check if it's a reply
        
            if (userVotes.has(itemId)) {
                const previousVote = userVotes.get(itemId);
                if (previousVote === "up" && isUpvote) {
                    // Undo upvote
                    const success = await updateVoteInDatabase(itemId, false, isReply);
                    if (success) {
                        adjustVote(event.target, -1);
                        userVotes.delete(itemId);
                    }
                } else if (previousVote === "down" && !isUpvote) {
                    // Undo downvote
                    const success = await updateVoteInDatabase(itemId, true, isReply);
                    if (success) {
                        adjustVote(event.target, 1);
                        userVotes.delete(itemId);
                    }
                } else {
                    // Change vote type
                    const success = await updateVoteInDatabase(itemId, isUpvote, isReply);
                    if (success) {
                        adjustVote(event.target, isUpvote ? 1 : -1);
                        const oppositeButton = parentItem.querySelector(
                            previousVote === "up" ? ".downvote-btn" : ".upvote-btn"
                        );
                        adjustVote(oppositeButton, previousVote === "up" ? 1 : -1);
                        userVotes.set(itemId, isUpvote ? "up" : "down");
                    }
                }
            } else {
                // New vote
                const success = await updateVoteInDatabase(itemId, isUpvote, isReply);
                if (success) {
                    adjustVote(event.target, isUpvote ? 1 : -1);
                    userVotes.set(itemId, isUpvote ? "up" : "down");
                }
            }
        }
    });

    function createVoteButton(symbol, className, initialVotes = 0) {
        const button = document.createElement("button");
        button.textContent = `${symbol} ${initialVotes}`;
        button.classList.add(className);
        button.dataset.votes = initialVotes;
        return button;
    }

    async function updateVoteInDatabase(itemId, isUpvote, isReply) {
        const endpoint = isReply 
            ? `/replies/${itemId}/${isUpvote ? 'upvote' : 'downvote'}`
            : `/posts/${itemId}/${isUpvote ? 'upvote' : 'downvote'}`;
    
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST'
            });
    
            if (!response.ok) {
                throw new Error('Failed to update vote');
            }
            return true;
        } catch (error) {
            console.error('Error updating vote:', error);
            return false;
        }
    }
    

    function generateUniqueId() {
        return "post-" + Math.random().toString(36).substr(2, 9);
    }
});

//Reyes code
document.addEventListener("DOMContentLoaded", function() {
    // Grab inputs from signup.html
    const signupForm = document.getElementById("signupForm");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const name = document.getElementById("name");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    
    // Grab login elements
    const loginButton = document.getElementById("loginButton");
    
    // Handle login button click
    if (loginButton) {
        console.log("Login button found, attaching event listener");
        
        loginButton.addEventListener("click", async function() {
            console.log("Login button clicked");
            
            const loguser = document.getElementById("username2");
            const logpass = document.getElementById("password2");
            
            if (!loguser.value || !logpass.value) {
                alert("Please enter both username and password");
                return;
            }
            
            console.log("Login attempt for user:", loguser.value);
            
            const userData = {
                username: loguser.value,
                password: logpass.value,
            };
            
            try {
                console.log("Sending login request to server...");
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                console.log("Server response status:", response.status);
                
                if (response.ok) {
                    const result = await response.text();
                    console.log("Login success response:", result);
                    alert("Login successful!");
                    currentUser = loguser.value;
                    localStorage.setItem("currentUser", currentUser);
                    
                    // Update the user display immediately
                    const userDisplay = document.getElementById('user-display');
                    if (userDisplay) {
                        userDisplay.textContent = `Welcome, ${currentUser}`;
                        userDisplay.classList.add('logged-in');
                    }
                    
                    window.location.href = "index.html";
                } else {
                    const errorText = await response.text();
                    console.log("Login error response:", errorText);
                    alert(`Login failed: ${errorText}`);
                }
            } catch (error) {
                console.error('Error during login request:', error);
                alert("An error occurred during login.");
            }
        });
    } else {
        console.log("Login button not found on this page");
    }
    
    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener("submit", async function(e) {
            e.preventDefault(); // This prevents the default form submission
            
            // Validation
            if (password.value !== confirmPassword.value) {
                alert("Passwords do not match!");
                return;
            }
            
            // Store as an array to be used in JSON
            const userData = {
                type: "user",
                username: username.value,
                email: email.value,
                name: name.value,
                password: password.value,
                admin: false
            };
            
            // Attempt to communicate information to server
            try {
                const response = await fetch('http://localhost:3000/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                // Error checks to identify what and where problems occur
                if (response.ok) {
                    alert("Signup successful!");
                    currentUser = username.value;
                    localStorage.setItem("currentUser", currentUser);

                    const userDisplay = document.getElementById('user-display');
                    if (userDisplay) {
                        userDisplay.textContent = `Welcome, ${currentUser}`;
                        userDisplay.classList.add('logged-in');
                    }
                    window.location.href = "index.html";
                } else {
                    const errorText = await response.text();
                    alert(`Signup failed: ${errorText}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert("An error occurred during signup.");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar");
    const postsContainer = document.querySelector(".posts");
    
    if (searchInput && postsContainer) {
        searchInput.addEventListener("input", function () {
            const query = searchInput.value.toLowerCase();
            const posts = document.querySelectorAll(".post");

            posts.forEach(post => {
                const postText = post.textContent.toLowerCase();
                if (postText.includes(query)) {
                    post.style.display = "block";
                } else {
                    post.style.display = "none";
                }
            });
        });
    }
});



