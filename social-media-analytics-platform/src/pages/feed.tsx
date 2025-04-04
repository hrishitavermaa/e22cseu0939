import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { token } from "../config/token";

interface Post {
  id: number;
  userid: number;
  content: string;
}

interface UserMap {
  [key: string]: string;
}

// Fetch users
const fetchUsers = async (): Promise<UserMap> => {
  const res = await axios.get<{ users: UserMap }>(
    "http://20.244.56.144/evaluation-service/users",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.users;
};

// Fetch posts for a single user
const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const res = await axios.get<{ posts: Post[] }>(
    `http://20.244.56.144/evaluation-service/users/${userId}/posts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data.posts;
};


const fetchAllPosts = async (): Promise<Post[]> => {
  const users = await fetchUsers();
  const allPosts: Post[] = [];

  const postPromises = Object.keys(users).map(async (userId) => {
    const userPosts = await fetchUserPosts(userId);
    return userPosts;
  });

  const results = await Promise.all(postPromises);
  results.forEach((userPosts) => allPosts.push(...userPosts));

  return allPosts.sort((a, b) => b.id - a.id); 
};

export default function Feed() {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["live-feed"],
    queryFn: fetchAllPosts,
    refetchInterval: 10000,
  });

  if (isLoading) return <p className="text-center mt-4">Loading feed...</p>;
  if (error)
    return <p className="text-center mt-4 text-red-500">Error loading feed</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">📢 Live Feed</h2>
      {posts && posts.length > 0 ? (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="p-4 bg-gray-100 rounded shadow-sm border"
            >
              <p className="font-medium text-gray-800">{post.content}</p>
              <p className="text-sm text-gray-500">Post ID: {post.id}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">No posts available</p>
      )}
    </div>
  );
}
