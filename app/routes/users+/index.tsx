import { Link } from "@remix-run/react";

const UsersIndexRoute = () => {
  return (
    <ul>
      <li>
        <Link to="michau" relative="path" className="text-blue-950 underline">
          Go to Michau
        </Link>
      </li>
    </ul>
  );
};

export default UsersIndexRoute;
