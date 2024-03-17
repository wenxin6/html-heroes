document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const filterValue = document.getElementById('filter');
    var serverNode;


    document.getElementById('filter-form').addEventListener('submit', async function(event) {
        event.preventDefault(); 
    
        serverNode = filterValue.value;
        console.log(serverNode);
    
    });

    
    if (!searchForm) {
        console.error('Search form not found');
        return;
    }

    searchForm.addEventListener('submit', async function(event) {
        event.preventDefault();


        const currentUserInput = searchForm.querySelector('input[name="user1_id"]');
        const searchQueryInput = searchForm.querySelector('input[name="user2_id"]');

        if (!currentUserInput || !searchQueryInput) {
            console.error('Input fields not found');
            return;
        }

        
        const currentUser = currentUserInput.value;
        const searchQuery = searchQueryInput.value;
        console.log("current: ", currentUser, "searching --> ", searchQuery, "from", serverNode,);

        
        try {
            const response = await fetch(`/openapi/${serverNode}/search/?q=${searchQuery}`);
            if (!response.ok) {
                throw new Error('Failed to search users on the selected server');
            }
            const data = await response.json();
            
            console.log(data);
            // 返回用户的profile页面
        } catch (error) {
            console.error('Error searching users:', error);
        }
        
    });
});


