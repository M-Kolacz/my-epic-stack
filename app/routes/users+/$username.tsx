import { Link } from "#app/components/ui/link";

const UsernameRoute = () => {
  return (
    <div>
      <div>Hi I am Michau</div>
      <Link to=".." relative="path">
        Go back to users
      </Link>
    </div>
  );
};

export default UsernameRoute;
