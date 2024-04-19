import { Link } from "#app/components/link";

const UsersIndexRoute = () => {
  return (
    <ul>
      <li>
        <Link to="michau" relative="path">
          Go to michau
        </Link>
      </li>
    </ul>
  );
};

export default UsersIndexRoute;
