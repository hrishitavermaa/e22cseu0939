import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { token } from "../config/token";

// Define types
interface Post {
  id: number;
  userid: number;
  content: string;
}

interface Comment {
  id: number;
  postid: number;
  content: string;
}

// Fetch all users
const fetchUsers = async (): Promise<Record<string, string>> => {
  const response = await axios.get<{ users: Record<string, string> }>(
    "http://20.244.56.144/evaluation-service/users", {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with a valid token
        },
      }
  );
  return response.data.users;
};

// Fetch posts for a user
const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const response = await axios.get<{ posts: Post[] }>(
    `http://20.244.56.144/evaluation-service/users/${userId}/posts`, {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with a valid token
        },
      }
  );
  return response.data.posts;
};

// Fetch comments for a post
const fetchPostComments = async (postId: number): Promise<number> => {
  const response = await axios.get<{ comments: Comment[] }>(
    `http://20.244.56.144/evaluation-service/posts/${postId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`, // Replace with a valid token
        },
      }
  );
  return response.data.comments.length;
};

export default function TrendingPosts() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [maxComments, setMaxComments] = useState(0);

  useEffect(() => {
    if (!users) return;

    const fetchTrendingPosts = async () => {
      const allPosts: Post[] = [];

      // Fetch all posts from all users
      for (const userId of Object.keys(users)) {
        const posts = await fetchUserPosts(userId);
        allPosts.push(...posts);
      }

      const postCommentCounts = await Promise.all(
        allPosts.map(async (post) => {
          const count = await fetchPostComments(post.id);
          return { ...post, commentCount: count };
        })
      );

      // Find the maximum comment count
      const maxCommentCount = Math.max(
        ...postCommentCounts.map((p) => p.commentCount),
        0
      );
      setMaxComments(maxCommentCount);

      // Filter posts that have the max comment count
      const trending = postCommentCounts.filter(
        (p) => p.commentCount === maxCommentCount
      );
      setTrendingPosts(trending);
    };

    fetchTrendingPosts();
  }, [users]);

  if (isLoading) return <p className="text-center text-lg">Loading posts...</p>;
  if (error)
    return <p className="text-center text-red-500">Error fetching posts</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">🔥 Trending Posts</h2>
      <p className="text-center text-gray-500">
        Most commented posts ({maxComments} comments)
      </p>
      {trendingPosts.length === 0 ? (
        <p className="text-center mt-4">No trending posts found</p>
      ) : (
        <ul>
          {trendingPosts.map((post) => (
            <li
              key={post.id}
              className="p-3 bg-gray-100 rounded-lg mb-2 shadow-sm"
            >
              <p className="font-medium">{post.content}</p>
              <span className="text-blue-600 text-sm">Post ID: {post.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
