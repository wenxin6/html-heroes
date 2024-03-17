document.addEventListener('DOMContentLoaded', function() {
    const selectElement = document.getElementById('filter');

    function fetchServerNodes() {
        fetch('/api/servernodes/')
            .then(response => response.json())
            .then(data => {
                data.forEach(serverNode => {
                    const option = document.createElement('option');
                    option.value = serverNode.name;
                    option.textContent = serverNode.name;
                    selectElement.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching ServerNodes:', error));
    }

    fetchServerNodes();

    let form = document.querySelector('.ac-container form');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let targetHost = document.querySelector('[name="targetHost"]').value;
        let username = document.querySelector('[name="username"]').value;
        let password = document.querySelector('[name="password"]').value;
        let localName = document.querySelector('[name="localName"]').value;
        let localUsersAPI = document.querySelector('[name="localUserListAPI"]').value;

        let formData = {
            username: username,
            password: password,
            from: localName,
            userAPI: localUsersAPI,
        };

        fetch(targetHost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (response.ok) {
                    fetch("/openapi/", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCSRFToken()
                        },
                        body: JSON.stringify({
                            username: "SD1",
                            password: "SD111",
                            from: targetHost,
                            userAPI: "search/",
                        })
                    }).then(r => {
                        if (response.ok) {
                            alert("Connection created. The remote nodes can be managed in `/admin/`");
                            return response.json();
                        }
                    })
                    return response.json();
                }
                else {
                    alert("Failed to connect new node.");
                    throw new Error('Network response was not ok.');
                }
            })
            .then(data => {
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});


function getCSRFToken() {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken' + '=')) {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

