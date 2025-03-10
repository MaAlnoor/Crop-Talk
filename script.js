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

    function createVoteButton(symbol, className) {
        const button = document.createElement("button");
        button.textContent = `${symbol} 0`;
        button.classList.add(className);
        button.dataset.votes = 0;
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
    const submitButton = document.getElementById("submitButton");
    const userName = document.getElementById("username");
    const userPass = document.getElementById("password");

    submitButton.addEventListener("click", async function() {
        window.userInputFromCollector = userName;
        window.userInputFromCollector = userPass;
        alert("hi")
    });
});


