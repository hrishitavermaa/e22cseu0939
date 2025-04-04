import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TopUser from "./pages/TopUser";
import TrendingPosts from "./pages/TopPost";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./component/navbar";
import Feed from "./pages/feed";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/top-user" element={<TopUser />} />
          <Route path="/trending-post" element={<TrendingPosts />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
