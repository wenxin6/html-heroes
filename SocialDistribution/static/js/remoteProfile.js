document.addEventListener('DOMContentLoaded', async function() {

    const selfUsername = _getURLSelfUsername();
    const remoteNodename = _getURLRemoteNodename();
    const remoteUsername = _getURLRemoteUsername();
    console.log("selfUsername ", selfUsername)
    console.log("remoteNodename ", remoteNodename)
    console.log("remoteUsername ", remoteUsername)

    let RemoteOPENAPIS = await _getRemoteUserOPENAPIS(remoteNodename, remoteUsername);
    console.log("RemoteOPENAPIS ", RemoteOPENAPIS)
    const {
        remote_node_Name,
        remote_openapi_url,
        remote_inbox_api_url,
        remote_follow_api_url,
    } = RemoteOPENAPIS

    const FRAcceptURL = `${window.location.protocol}//${window.location.hostname}/openapi/accept-remote-follow/${remote_node_Name}/${selfUsername}/${remoteUsername}/`;
    const FRRejectURL = `${window.location.protocol}//${window.location.hostname}/openapi/reject-remote-follow/${remote_node_Name}/${selfUsername}/${remoteUsername}/`;
    console.log("FRAcceptURL", FRAcceptURL)
    console.log("FRRejectURL", FRRejectURL)

    const urlsJSON = {
        click_to_accept_the_remote_follow_request: FRAcceptURL,
        click_to_reject_the_remote_follow_request: FRRejectURL
    };

    const followButton = document.getElementById('follow-btn');
    const unfollowButton = document.getElementById('unfollow-btn');
    const relationInstruction = document.getElementById('relation');

    followButton.style.display = "none";
    unfollowButton.style.display = "none";


    fetch(`/api/user/${selfUsername}/anyRelations/${remoteUsername}/`)
        .then(relationResponse => {
            if (!relationResponse.ok) {
                throw new Error('Network response was not ok.');
            }
            return relationResponse.json();
        })
        .then(relations => {
            if (relations["already_friend"]) {
                relationInstruction.textContent = `- ${remoteUsername} Is Your Remote Friend from ${remoteNodename}-`;
                followButton.style.display = "none";
                unfollowButton.style.display = "inline";
            }
            else if (relations["user1_follows_user2"] && relations["user2_followed_by_user1"]) {
                relationInstruction.textContent = `- You Are Following Remote User ${remoteUsername} from ${remoteNodename} -`;
                followButton.style.display = "none";
                unfollowButton.style.display = "inline";
            }
            else if (relations["user2_follows_user1"] && relations["user1_followed_by_user2"]) {
                relationInstruction.textContent = `- ${remoteUsername} from ${remoteNodename} Is Your Remote Follower -`;
                followButton.style.display = "inline";
                unfollowButton.style.display = "none";
            }
            else {
                relationInstruction.textContent = `- Hi, I'm ${remoteUsername} from ${remoteNodename}, Nice To Meet U -`;
                followButton.style.display = "inline";
                unfollowButton.style.display = "none";
            }
        })


    if (followButton) {
        followButton.addEventListener('click', function() {
            // Todo - Check if they are already friends, if not then continue the follow process:
            let areFriends = true;
            fetch(`/api/user/${selfUsername}/anyRelations/${remoteUsername}/`)
                .then(relationResponse => {
                    if (!relationResponse.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return relationResponse.json();
                })
                .then(relations => {
                    areFriends = relations["already_friend"];
                    if (areFriends) {
                        alert("You are already friends!!");
                    }
                    else {
                        // Todo - For `USER_SELF`, set `USER_TARGET` as a following of `USER_SELF`:
                        fetch(`/api/user/${selfUsername}/followerOf/${remoteUsername}/`, {
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken'),
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(response => {
                                if (response.ok) {
                                    createRemoteMessage(remote_inbox_api_url, "FR", JSON.stringify(urlsJSON), selfUsername + " from " + window.location.hostname)
                                    followButton.style.display = 'none';
                                    unfollowButton.style.display = 'none';
                                    alert("Follow request sent successfully! Pending Review...");
                                    // Todo - For BOTH, if the two are following each other and being followed by each other,
                                    //  then activate the “friend mechanism”, remove their following & follower relations but
                                    //  keep a friend relation between them:
                                    fetch(`/api/user/${selfUsername}/anyRelations/${remoteUsername}/`)
                                        .then(relationResponse => {
                                            if (relationResponse.ok) {
                                                return relationResponse.json()
                                            }
                                        })
                                        .then(relations => {
                                            let isFriend = relations["mutual_follow"]
                                            if (isFriend) {
                                                // Todo - If relationships are valid, then process the “friend mechanism”:
                                                fetch(`/api/user/${selfUsername}/friend/${remoteUsername}/`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'X-CSRFToken': getCookie('csrftoken'),
                                                        'Content-Type': 'application/json'
                                                    }
                                                })
                                                    .then(relationResponse => {
                                                        if (relationResponse.ok) {
                                                            alert("You are friends now!!")
                                                            return relationResponse.json()
                                                        }
                                                    })
                                                    .catch(error => console.error('Error:', error));
                                            }
                                        })
                                        .catch(error => console.error('Error:', error));
                                }
                                else {
                                    alert("Already Followed.");
                                }
                            })
                            .catch(error => console.error('Error:', error));
                    }
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        });
    }

    // Todo - Unfollow Logics:
    //  1. Only self follow other    >>      delete 1->2 follow-ship;
    //  2. we are friend            >>       delete 1<->2 friend-ship，add 2->1 follow-ship;
    if (unfollowButton) {
        unfollowButton.addEventListener('click', function() {
            alert("fuck");
            fetch(`/api/user/${selfUsername}/anyRelations/${remoteUsername}/`)
                .then(relationResponse => {
                    if (!relationResponse.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    return relationResponse.json();
                })
                .then(relations => {
                    if (relations["user1_follows_user2"] && relations["user2_followed_by_user1"]) {
                        fetch(`/api/user/${selfUsername}/unfollowerOf/${remoteUsername}/`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken'),
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok.');
                                }
                                return response.json();
                            })
                            .then(relations => {
                                fetch(`/api/user/${remoteUsername}/unfollowing/${selfUsername}/`, {
                                    method: 'DELETE',
                                    headers: {
                                        'X-CSRFToken': getCookie('csrftoken'),
                                        'Content-Type': 'application/json'
                                    }
                                })
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error('Network response was not ok.');
                                        }
                                        else {
                                            alert("Unfollow Successfully.");
                                            unfollowButton.style.display = 'none';
                                            followButton.style.display = 'inline';
                                        }
                                        return response.json();
                                    })
                            })
                    }
                    else if (relations["already_friend"]) {
                        fetch(`/api/user/${selfUsername}/unfriend/${remoteUsername}/`, {
                            method: 'DELETE',
                            headers: {
                                'X-CSRFToken': getCookie('csrftoken'),
                                'Content-Type': 'application/json'
                            }
                        })
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error('Network response was not ok.');
                                }
                                else {
                                    alert(`Unfollow Successfully, ${remoteUsername} Is Still Following You.`);
                                    unfollowButton.style.display = 'none';
                                    followButton.style.display = 'inline';
                                }
                                return response.json();
                            })

                    }
                })

        });
    }

});


// Load recent posts for the user
document.addEventListener('DOMContentLoaded', () => {
    const recentPostsContainer = document.getElementById('recent-posts');
    const username = _getURLRemoteUsername();

    fetch(`/api/user/${username}/posts`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            if (Array.isArray(data.posts)) {
                data.posts.forEach(post => {
                    let postElement = document.createElement('div');
                    postElement.className = 'post';

                    const postLink = document.createElement('a');
                    postLink.href = `/posts/${post.id}`;
                    postLink.className = 'post-link';

                    const datePosted = new Date(post.date_posted);
                    const formattedDate = `${datePosted.getFullYear()}-${datePosted.getMonth() + 1}-${datePosted.getDate()}`;

                    const contentHTML = `
                        <div class="content">
                        ${post.image ? `<img src="${post.image}" alt="" width="120" height="120"/>` : ''}
                            <div class="post-title">${post.title}
                            <div class="corner-icon">
                                ${post.content_type === 'COMMONMARK' ? '<ion-icon name="logo-markdown" padding: 0 10px; position: relative; margin-left: auto;></ion-icon>' : ''}
                                ${post.visibility === 'FRIENDS' ? '<ion-icon name="people" style="padding: 0 10px; position: relative; margin-left: auto;"></ion-icon>' : ''}
                                ${post.visibility === 'PRIVATE' ? '<ion-icon name="eye-off" style="padding: 0 10px; position: relative; margin-left: auto;"></ion-icon>' : ''}
                            </div>
                            </div>
                            <div class="post-time">${formattedDate}</div>
                            <p class="post-content">${post.content}</p>
                        </div>
                    `;

                    postLink.innerHTML = contentHTML;
                    postElement.appendChild(postLink);
                    recentPostsContainer.appendChild(postElement);

                });
            }
            else {
                console.error('Error: Expected an array of posts');
                recentPostsContainer.innerHTML = '<p>Error loading posts.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            recentPostsContainer.innerHTML = '<p>Error loading posts.</p>';
        });
});


// Load friend list
document.addEventListener('DOMContentLoaded', () => {
    const friendListContainer = document.getElementById('friendList');
    const username = _getURLRemoteUsername();

    fetch(`/api/user/${username}/friends/`)
        .then(response => response.json())
        .then(friendships => {
            // console.log(friendships.length);
            if (friendships.length === 0) {
                friendListContainer.style.display = 'none';
                return;
            }

            friendships.forEach(friendship => {

                let friend;
                if (friendship.user1.username === username) {
                    friend = friendship.user2;
                }
                else {
                    return;
                }
                console.log(friend);

                let friendElement = document.createElement('div');
                friendElement.className = 'friend-info';

                friendElement.innerHTML = `
                <div class="friend-avatar">
                    <img src="${friend.avatar}" alt="Friend Avatar">
                </div>
                <div class="friend-name">
                    <a href="/profile/${username}/${friend.username}">${friend.username}</a> 
                </div>
                `;

                friendListContainer.appendChild(friendElement);
            });
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
            friendListContainer.innerHTML = '<p>Error loading friends.</p>';
        });
});


function _getURLRemoteUsername() {
    const pathSections = window.location.pathname.split('/').filter(Boolean);
    return pathSections[pathSections.length - 1];
}

function _getURLRemoteNodename() {
    const pathSections = window.location.pathname.split('/').filter(Boolean);
    return pathSections[pathSections.length - 2];
}

function _getURLSelfUsername() {
    const pathSections = window.location.pathname.split('/').filter(Boolean);
    return pathSections[pathSections.length - 3];
}

function _getRelationAnalysis(relationResponse) {
    relationResponse = relationResponse.json()
    console.log('Relationship data:', relationResponse);
    return relationResponse.get("mutual_follow")
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

async function createRemoteMessage(remoteMsgOpenAPI, messageType, content, origin = "SYS") {
    const csrfToken = getCsrfToken();
    const response = await fetch(remoteMsgOpenAPI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            message_type: messageType,
            origin: origin,
            content: content,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Message created successfully:', data);
    }
    else {
        const error = await response.json();
        console.error('Failed to create message:', response.status, response.statusText, error);
    }
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
