'use strict';


document.addEventListener('DOMContentLoaded', async () => {
    const username = _getURLUsername()

    await _checkRemoteFriends(username);

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
                        <button id="comment-${post.id}" type="button" data-post-id="${post.id}">
                            <ion-icon size="small" name="chatbox-ellipses-outline" style="margin-right: 8px;">
                            </ion-icon>
                                ${post.comment_count > 0 ? '' : 'Comment'} 
                                <span class="comment-count">${post.comment_count > 0 ? post.comment_count : ''}
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

                // Append userInfoHTML, contentHTML, and interactionHTML to postLink instead of postElement
                postLink.innerHTML = userInfoHTML + contentHTML + interactionHTML;
                postElement.appendChild(postLink);
                // postElement.innerHTML += interactionHTML;
                postContainer.appendChild(postElement);


            });
        })
        .catch(error => console.error('Error:', error));
});

function _getURLUsername() {
    const pathSections = window.location.pathname.split('/');
    return pathSections[2];
}


async function _getRemoteUserOPENAPIS(serverNodeName, username) {
    const encodedServerNodeName = encodeURIComponent(serverNodeName);
    const encodedUsername = encodeURIComponent(username);

    const url = `/api/getRemoteUserOPENAPIS/${encodedServerNodeName}/${encodedUsername}/`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("data", data);
        return data;
    } catch (error) {
        console.error('Error fetching remote user data:', error);
    }
}

async function _checkRemoteFriends(username) {
    const apiEndpoint = `/api/user/${username}/friends/`;

    try {
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const friendsList = await response.json();
        friendsList.forEach(friend => {
            if (friend.server_node_name && friend.server_node_name !== "Local") {
                console.log(`${friend.username} is a remote user from server node: ${friend.server_node_name}`);
                let RemoteOPENAPIS = _getRemoteUserOPENAPIS(friend.server_node_name, friend.username);
                console.log("RemoteOPENAPIS ", RemoteOPENAPIS)
                const {
                    remote_node_Name,
                    remote_openapi_url,
                    remote_inbox_api_url,
                    remote_follow_api_url,
                } = RemoteOPENAPIS

                fetchNonPrivatePostsAndCreateNew(remote_follow_api_url, friend.username);
            }
        });
    } catch (error) {
        console.error('Failed to get friends list:', error);
    }
}


function fetchNonPrivatePostsAndCreateNew(url, username) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(posts => {
      posts.forEach(post => {
        _createNewPost(post);
      });
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
}

function _createNewPost(postData) {
    const createPostUrl = `${baseUrl}/api/nps/`;
    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    };

    fetch(createPostUrl, requestOptions)
        .then(response => response.json())
        .then(newPost => {
            console.log('New post created:', newPost);
        })
        .catch(error => {
            console.error('Error creating new post:', error);
        });
}



