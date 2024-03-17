from django.contrib import admin
from django.contrib.auth.views import LogoutView
from django.urls import path, include
from rest_framework.routers import SimpleRouter

from . import views
from .views import *

app_name = "SocialDistribution"

router = SimpleRouter()

urlpatterns = [
    # Basic PAGE View Settings:
    path("", approved_user_required(IndexView.as_view()), name="PAGE_Home"),
    path('admin/', admin.site.urls, name="PAGE_Admin"),
    path("login/", LoginView.as_view(), name="PAGE_Login"),
    path("addConnect/", AddConnectView.as_view(), name="PAGE_AddConnect"),
    path('logout/', LogoutView.as_view(), name='PAGE_Logout'),
    path("signup/", signupView, name="PAGE_Signup"),
    path("friendPosts/<str:username>/", approved_user_required(FriendPostsView.as_view()), name="PAGE_FriendPosts"),
    path("inbox/<str:username>/", approved_user_required(InboxView.as_view()), name="PAGE_Inbox"),
    path("posts/<int:post_id>/", approved_user_required(PostDetailView.as_view()), name="PAGE_postDetail"),


    # Friend API System:
    path('search/', approved_user_required(views.search_user), name='PAGE_SearchUser'),
    path('profile/<str:username>/followers/', approved_user_required(FollowerView.as_view()), name='PAGE_FollowersList'),
    path('profile/<str:username>/following/', approved_user_required(FollowingView.as_view()), name='PAGE_FollowingList'),
    path('profile/<str:username>/friends/', approved_user_required(FriendView.as_view()), name='PAGE_FriendList'),
    path("profile/<str:username>/draft/", approved_user_required(author_draft_view), name="API_AuthorDraft"),

    path('api/user/<str:username>/posts/', ProfileAPIView.as_view(), name='API_profile'),

    path("api/user/<str:username>/followers/", FollowersAPIView.as_view(), name="API_GETFollowers"),                                        # GET User FollowerList             --> Test Success
    path("api/user/<str:username>/following/", FollowingAPIView.as_view(), name="API_GETFollowing"),                                        # GET User FollowerList             --> Test Success
    path("api/user/<str:username>/friends/", FriendsAPIView.as_view(), name="API_GETFriends"),                                              # GET User FriendList               --> Test Success
    path('api/user/<str:selfUsername>/followerOf/<str:targetUsername>/', CreateFollowerAPIView.as_view(), name='API_POSTFollowerOf'),       # POST Create FollowerOf Case       --> Test Success
    path('api/user/<str:selfUsername>/following/<str:targetUsername>/', CreateFollowingAPIView.as_view(), name='API_POSTFollowing'),        # POST Create Following Case        --> Test Success
    path('api/user/<str:selfUsername>/friend/<str:targetUsername>/', createFriendshipAPIView, name='API_POSTFriend'),                       # POST Create Friend Case           --> Test Success
    path('api/user/<str:selfUsername>/unfollowerOf/<str:targetUsername>/', DeleteFollowerAPIView.as_view(), name='API_DELETEFollowerOf'),   # DELETE Follower Case for usr1     --> ??
    path('api/user/<str:selfUsername>/unfollowing/<str:targetUsername>/', DeleteFollowingAPIView.as_view(), name='API_DELETEFollowing'),    # DELETE Following Case for usr1    --> ??
    path('api/user/<str:selfUsername>/unfriend/<str:targetUsername>/', deleteFriendshipAPIView, name='API_DELETEFriend'),                   # DELETE Friend Case for usr1       --> ??
    path('api/user/<str:username1>/anyRelations/<str:username2>/', AnalyzeRelationAPIView.as_view(), name='API_AnalyzeRelation'),           # GET Check Relations b/w Users     --> Test Success

    path('api/follow-requests/accept/<str:origin_username>/', AcceptFollowRequestAPIView.as_view(), name='accept-follow-request'),
    path('api/follow-requests/reject/<str:origin_username>/', RejectFollowRequestAPIView.as_view(), name='reject-follow-request'),

    # Identity API System:
    path("api/users/", UsersAPIView.as_view({'get': 'list'}), name="API_ALL_USER"),
    path("api/user/<str:username>/", UserAPIView.as_view(), name="API_USER"),                                                               # GET Self User/Profile Info        --> Test Success
    path("api/user/<str:user1_id>/<str:user2_id>/", UserAPIView.as_view(), name="API_USER_TWO"),                                            # GET Other's User/Profile Info     --> Test Success
    path("profile/<str:username>/", approved_user_required(ProfileView.as_view()), name="PAGE_Profile"),

    path("friendPosts/<str:username>/profile/<str:selfUsername>/<str:targetUsername>/",
        lambda request, username, selfUsername, targetUsername:
        redirect('PAGE_OtherProfile', selfUsername=selfUsername, targetUsername=targetUsername)),
    path("profile/<str:username>/upload-avatar/", approved_user_required(upload_avatar), name="API_UploadAvatar"),
    path("profile/<str:username>/update-bio/", approved_user_required(update_bio), name="API_UpdateBio"),
    path("profile/<str:username>/update-username/", approved_user_required(update_username), name="API_UpdateUsername"),
    path('profile/<str:username>/update-github-username/', approved_user_required(views.update_github_username), name='PAGE_LinkGithub'),
    path('profile/<str:username>/update-github-username-submit/', approved_user_required(views.update_github_username_submit), name='API_UpdateGithubUsername'),
    path("profile/<str:selfUsername>/<str:targetUsername>/", approved_user_required(otherProfileView), name="PAGE_OtherProfile"),

    # Post API System:
    path("api/pps/", PPsAPIView.as_view(), name="API_PPs"),                                                                                 # GET PublicPostsList               --> Test Success
    path("api/fps/<str:username>/", FPsAPIView.as_view(), name="API_FPs"),                                                                  # GET FriendPostsList               --> Test Success
    path("api/nps/", NPsAPIView.as_view(), name="API_NPs"),                                                                                 # POST NewPosts                     --> Test Success
    path('api/posts/<int:post_id>/', PostOperationAPIView.as_view(), name='API_PDetail'),                                                   # GET/PUT/DELETE PostsOperations
    path("api/posts/<int:post_id>/comments/", CommentAPIView.as_view(), name='API_PComms'),                                                 # GET/POST CommentList/NewComment   --> Test Success
    path("api/posts/<int:post_id>/likes/", LikeAPIView.as_view(), name='API_PLikes'),                                                       # GET/POST LikeList/NewLike         --> Test Success
    path('api/posts/<int:post_id>/check-like/', check_like_status, name='check_like_status'),
    path('api/posts/<int:post_id>/share/', SharePostView.as_view(), name='share_post'),
    path('api/posts/<int:post_id>/delete/', DeletePostView.as_view(), name='API_delete_post'),                                              # DELETE post                       --> Test Success
    path('api/posts/<int:post_id>/update/', UpdatePostView.as_view(), name='update_post'),                                                  # GET/PUT edit and update post      --> Test Success
    path('user/<str:username>/posts/<int:post_id>/image/<int:image_id>', approved_user_required(views.get_image), name='image-post'),

    # Inbox API System:
    path('api/msgs/retrieve/<str:type>/', UserMessagesAPIView.as_view(), name='API_GETUserMsgs'),                                           # GET TypeMessagesForUser           --> Test Success
    path('api/msgs/create/', CreateMessageAPIView.as_view(), name='API_POSTUserMsg'),                                                       # POST TypeMessageForUser           --> Test Success
    path('api/msgs/deleteType/<str:type>/', DeleteTypeOfMessageAPIView.as_view(), name='API_DELETEMsgType'),                                # DELETE TypeMessageForUser         -->
    path('api/msgs/deleteID/<int:ID>/', DeleteIDOfMessageAPIView.as_view(), name='API_DELETEMsgID'),


    # OpenAPI System:
    path('openapi/', OpenAPIView.as_view({'post': 'create', 'get': 'list', }), name='OPENAPI_AddConnect'),
    path('openapi/<str:server_node_name>/search/', views.searchUserOPENAPI, name='OPENAPI_SearchUser'),
    path('openapi/message/<str:username>/', CreateMessageOPENAPIView.as_view(), name='OPENAPI_POSTUserMsg'),
    path('openapi/followrequest/accept/<str:username>/', AcceptFollowRequestAPIView.as_view(), name='OPENAPI_AcceptFollowRequest'),
    path('openapi/followrequest/reject/<str:username>/', RejectFollowRequestAPIView.as_view(), name='OPENAPI_RejectFollowRequest'),

    path('api/servernodes/', ServerNodeList.as_view(), name='nodeList'),
    
]



# DRF API Routers
router.register(f"api/users", UsersAPIView, basename='users')


# Add routers
urlpatterns.append(path('', include(router.urls)))

"""
MESSAGE_TYPES = [
    ('FR', 'Follow Request'),
    ('LK', 'Like'),
    ('CM', 'Comment'),
    ('NP', 'New Post Reminder'),
    ('SU', 'New Sign Up')
]
"""
