import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { token } from "../config/token";

// Define types
interface UserResponse {
  users: Record<string, string>; // Mapping of user ID to name
}

interface PostResponse {
  posts: { id: number; userid: number; content: string }[];
}

interface UserPostCount {
  id: string;
  name: string;
  count: number;
}

// Fetch users from API
const fetchUsers = async (): Promise<UserResponse["users"]> => {
  const response = await axios.get<UserResponse>(
    "http://20.244.56.144/evaluation-service/users",
    {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    }
  );
  return response.data.users;
};

// Fetch post count for a user
const fetchUserPostsCount = async (userId: string): Promise<number> => {
  const response = await axios.get<PostResponse>(
    `http://20.244.56.144/evaluation-service/users/${userId}/posts`,
    {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    }
  );
  return response.data.posts.length;
};

export default function TopUsers() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserResponse["users"], Error>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const [userPostCounts, setUserPostCounts] = useState<UserPostCount[]>([]);

  useEffect(() => {
    if (!users) return;

    const fetchAllPostCounts = async () => {
      const userEntries = Object.entries(users);
      const promises = userEntries.map(async ([id, name]) => {
        const count = await fetchUserPostsCount(id);
        return { id, name, count };
      });

      const results = await Promise.all(promises);
      results.sort((a, b) => b.count - a.count); // Sort in descending order
      setUserPostCounts(results.slice(0, 5)); // Get top 5 users
    };

    fetchAllPostCounts();
  }, [users]);

  if (isLoading) return <p className="text-center text-lg">Loading users...</p>;
  if (error)
    return <p className="text-center text-red-500">Error fetching users</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">🏆 Top 5 Users</h2>
      <ul>
        {userPostCounts.map((user, index) => (
          <li
            key={user.id}
            className="flex justify-between p-3 bg-gray-100 rounded-lg mb-2 shadow-sm"
          >
            <span className="font-medium">
              {index + 1}. {user.name}
            </span>
            <span className="font-semibold text-blue-600">
              {user.count} Posts
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
