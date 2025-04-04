function Navbar() {
  return (
    <div>
      <ul className="w-full flex justify-center items-center gap-x-7 list-style-none">
        <li>
          <a href="/top-user">Top Users</a>
        </li>
        <li>
          <a href="/trending-post">Trending Posts</a>
        </li>
        <li>
          <a href="/feed">Feed</a>
        </li>
      </ul>
    </div>
  );
}

export default Navbar;
