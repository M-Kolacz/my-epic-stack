import { Link } from "@remix-run/react";

const UsernameRoute = () => {
  return (
    <div>
      <div>Hi I am Michau</div>
      <Link to=".." relative="path" className="text-blue-950 underline">
        Go back to users
      </Link>
    </div>
  );
};

export default UsernameRoute;
