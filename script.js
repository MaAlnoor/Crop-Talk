document.addEventListener("DOMContentLoaded", () => {
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
    /** 
    if (postButton) {
        postButton.addEventListener("click", () => {
            const content = postContent.value.trim();
            if (content === "") {
                alert("Post cannot be empty!");
                return;
            }

            // Create a new post element
            const newPost = document.createElement("div");
            newPost.classList.add("post");
            newPost.dataset.postId = generateUniqueId();

            // Create paragraph element for text content
            const postText = document.createElement("p");
            postText.textContent = content; // Prevents XSS

            // Create Upvote, Downvote, and Reply buttons
            const upvoteButton = createVoteButton("👍", "upvote-btn");
            const downvoteButton = createVoteButton("👎", "downvote-btn");
            const replyButton = document.createElement("button");
            replyButton.textContent = "Reply";
            replyButton.classList.add("reply-btn");

            // Create replies container
            const repliesDiv = document.createElement("div");
            repliesDiv.classList.add("replies");

            // Append elements
            newPost.appendChild(postText);
            newPost.appendChild(upvoteButton);
            newPost.appendChild(downvoteButton);
            newPost.appendChild(replyButton);
            newPost.appendChild(repliesDiv);
            postsSection.appendChild(newPost);

            // Clear input field
            postContent.value = "";
        });
    }
    */

        
    async function fetchAndDisplayPosts() {
        try {
            const response = await fetch('http://localhost:3000/posts');
            if (response.ok) {
                const posts = await response.json();
                displayPosts(posts); // Display the fetched posts
            } else {
                console.error('Failed to fetch posts:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    // Function to display posts
    function displayPosts(posts) {
        postsSection.innerHTML = ""; // Clear existing posts

        posts.forEach(post => {
            const newPost = document.createElement("div");
            newPost.classList.add("post");
            newPost.dataset.postId = post._id || generateUniqueId(); // Use database ID or generate one

            // Create paragraph element for text content
            const postText = document.createElement("p");
            postText.textContent = post.question; // Use the 'question' field from the database

            // Create elements for username and date
            
            const postUsername = document.createElement("p");
            const postDate = document.createElement("p");
            const postUserAndDate = document.createElement("p");

            postUsername.textContent = `${post.username}`;
            postUsername.classList.add("post-username");            
            postDate.textContent = `${post.date}`;
            postDate.classList.add("post-date");

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
            newPost.appendChild(postUserAndDate);
            newPost.appendChild(postText);
            newPost.appendChild(upvoteButton);
            newPost.appendChild(downvoteButton);
            newPost.appendChild(replyButton);
            newPost.appendChild(repliesDiv);

            // Append the new post to the posts section
            postsSection.appendChild(newPost);
        });
    }

    // Fetch and display posts when the page loads
    fetchAndDisplayPosts();


    if (postButton) {
        postButton.addEventListener("click", async function(e) {
            e.preventDefault(); // Prevents unintended form submission if inside a form
            const content = postContent.value.trim();
            let currentUser = localStorage.getItem("currentUser") || "Guest";

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
    postsSection.addEventListener("click", (event) => {
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
            
            let repliesSection = parentPost.querySelector(".replies");
            if (!repliesSection) {
                repliesSection = document.createElement("div");
                repliesSection.classList.add("replies");
                parentPost.appendChild(repliesSection);
            }
        
            const replyText = replyInput.value.trim();
            if (replyText !== "") {
                const replyDiv = document.createElement("div");
                replyDiv.classList.add("reply");
                replyDiv.dataset.postId = generateUniqueId();
        
                const replyContent = document.createElement("p");
                replyContent.textContent = replyText; // Prevents XSS
        
                const upvoteButton = createVoteButton("👍", "upvote-btn");
                const downvoteButton = createVoteButton("👎", "downvote-btn");
                const replyButton = document.createElement("button");
                replyButton.textContent = "Reply";
                replyButton.classList.add("reply-btn");
        
                replyDiv.appendChild(replyContent);
                replyDiv.appendChild(upvoteButton);
                replyDiv.appendChild(downvoteButton);
                replyDiv.appendChild(replyButton);
                repliesSection.appendChild(replyDiv);
        
                // Remove reply input and submit button after submitting
                if (replyInput) replyInput.remove();
                if (event.target) event.target.remove();
            } else {
                alert("Reply cannot be empty!");
            }
        }
        

        if (event.target.classList.contains("upvote-btn") || event.target.classList.contains("downvote-btn")) {
            const parentPost = event.target.closest(".post, .reply");
            const postId = parentPost.dataset.postId;
            const isUpvote = event.target.classList.contains("upvote-btn");

            if (userVotes.has(postId)) {
                const previousVote = userVotes.get(postId);
                if (previousVote === "up" && isUpvote) {
                    adjustVote(event.target, -1);
                    userVotes.delete(postId);
                } else if (previousVote === "down" && !isUpvote) {
                    adjustVote(event.target, 1);
                    userVotes.delete(postId);
                } else {
                    adjustVote(event.target, isUpvote ? 1 : -1);
                    adjustVote(parentPost.querySelector(previousVote === "up" ? ".upvote-btn" : ".downvote-btn"), previousVote === "up" ? -1 : 1);
                    userVotes.set(postId, isUpvote ? "up" : "down");
                }
            } else {
                adjustVote(event.target, isUpvote ? 1 : -1);
                userVotes.set(postId, isUpvote ? "up" : "down");
            }
        }
    });

    function createVoteButton(symbol, className, initialVotes = 0) {
        const button = document.createElement("button");
        button.textContent = `${symbol} ${initialVotes}`; // Display initial vote count
        button.classList.add(className);
        button.dataset.votes = initialVotes; // Store the vote count in a data attribute
        return button;
    }

    function adjustVote(button, value) {
        let votes = parseInt(button.dataset.votes);
        votes += value;
        button.dataset.votes = votes;
        button.textContent = button.textContent.split(" ")[0] + ` ${votes}`;
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
                    alert(`Current user set to: ${currentUser}`); // Debugging line
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
                    alert(`Current user set to: ${currentUser}`); // Debugging
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
