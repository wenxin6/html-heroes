document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const filterValue = document.getElementById('filter');
    
    document.getElementById('filter-form').addEventListener('submit', function(event) {
        event.preventDefault(); 

        var serverName = filterValue.value;
        console.log(serverName);
        // 发送请求到远程服务器
        // fetch(`https://remote-server.com/api/users?filter=${filterValue}`)
        //     .then(response => response.json())
        //     .then(data => {
        //         // 处理响应数据，例如更新页面上的用户列表
        //         console.log(data);
        //     })
        //     .catch(error => {
        //         console.error('Error:', error);
        //     });
    });

    
    if (!searchForm) {
        console.error('Search form not found');
        return;
    }

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentUserInput = searchForm.querySelector('input[name="user1_id"]');
        const searchQueryInput = searchForm.querySelector('input[name="user2_id"]');

        if (!currentUserInput || !searchQueryInput) {
            console.error('Input fields not found');
            return;
        }

        const currentUser = currentUserInput.value;
        const searchQuery = searchQueryInput.value;
        console.log(currentUser, searchQuery);


        fetch(`/search?q=${encodeURIComponent(searchQuery)}`)
            .then(response => response.json())
            .then(data => {
                if (data.url) {
                    fetch(`profile/${currentUser}/${searchQuery}`)
                        .then(response => {
                            if (!response.ok) {
                                alert("User not found");
                            }
                             window.location.href = `profile/${currentUser}/${searchQuery}`;
                        })
                } else {
                    alert("User not found");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while searching");
            });
    });
});


