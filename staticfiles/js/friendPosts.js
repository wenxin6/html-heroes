'use strict';


document.addEventListener('DOMContentLoaded', () => {
    const username = _getURLUsername()
    fetch(`/api/fps/${username}/`)
        .then(response => response.json())
        .then(posts => {
            console.log('Friends List:', posts);
            const postContainer = document.getElementById('post-container');
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post';

                const postLink = document.createElement('a');
                postLink.href = `/posts/${post.id}`;
                postLink.className = 'post-link';

                const datePosted = new Date(post.date_posted);
                const formattedDate = `${datePosted.getFullYear()}-${datePosted.getMonth() + 1}-${datePosted.getDate()}`;
                
                const userInfoHTML = `
                    <div class="user-info">
                        <img src="${post.avatar}" alt="profile avatar" class="user-avatar">
                        <div class="username">${post.username || 'Unknown User'}</div>
                        <div class="post-time">${formattedDate}</div>
                        <div class="corner-icon">
                            ${post.content_type === 'COMMONMARK' ? '<ion-icon name="logo-markdown" style="padding: 10px;"></ion-icon>' : ''}
                            ${post.visibility === 'FRIENDS' ? '<ion-icon name="people" style="padding: 10px;"></ion-icon>' : ''}
                        </div>
                    </div>
                `;

                const contentHTML = `
                    <div class="content">
                        <div class="title">${post.title}</div>
                        <p class="post-content">${post.content}</p>
                    </div>
                `;

                const interactionHTML = `
                    <div class="interact-container">
                        <button id="share-${post.id}" type="button" data-post-id="${post.id}">
                            <ion-icon size="small" name="share-outline" style="margin-right: 8px;"></ion-icon>
                            Share <span class="share-count">${post.share_count}</span>
                        </button>
                        <button id="comment-${post.id}" type="button" data-post-id="${post.id}">
                            <ion-icon size="small" name="chatbox-ellipses-outline" style="margin-right: 8px;">
                            </ion-icon>
                                ${post.comment_count > 0 ? '' : 'Comment'} 
                                <span class="comment-count">${post.comment_count > 0 ? post.comment_count: ''}
                            </span>
                        </button>
                        <button id="like-${post.id}" type="button" data-post-id="${post.id}"> 
                            <ion-icon size="small" name="heart-outline" style="margin-right: 8px;">
                            </ion-icon>
                                    ${post.likes_count > 0 ? '' : 'Like'}
                                <span class="like-count">${post.likes_count > 0 ? post.likes_count : ''}</span>
                        </button>
                    </div>
                `;

                postLink.innerHTML = userInfoHTML + contentHTML;
                postElement.appendChild(postLink);
                postElement.innerHTML += interactionHTML;
                postContainer.appendChild(postElement);

                const likeButton = postElement.querySelector(`#like-${post.id}`);
                likeButton.addEventListener('click', function() {
                    console.log("like clicked",`api/posts/${post.id}/likes/`);
                    // 点赞操作的 AJAX 请求
                    // 更新点赞计数
                    fetch(`/api/posts/${post.id}/likes/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken'), 
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.status === 'success') {
                            // 更新页面上的点赞计数
                            const likeCountSpan = postElement.querySelector(`#like-${post.id} .like-count`);
                            likeCountSpan.textContent = data.likes_count; // 假设后端返回更新后的点赞计数
                        } else {
                            // 处理错误情况
                            console.error('Error:', data.error);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                });


                // Event listeners for like button
                const commentButton = postElement.querySelector(`#comment-${post.id}`);
                commentButton.addEventListener('click', function() {
                    console.log("comment clicked");
                    // 评论操作的 AJAX 请求
                    // 更新评论计数
                });
            });
        })
        .catch(error => console.error('Error:', error));
});

function _getURLUsername() {
    const pathSections = window.location.pathname.split('/');
    return pathSections[2];
}


