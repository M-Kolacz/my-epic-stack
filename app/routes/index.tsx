import type { MetaFunction } from "@remix-run/node";
import { Link } from "#app/components/link";
import { useEffect } from "react";
import { toast } from "sonner";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  useEffect(() => {
    toast("Welcome to Remix! 🎉");
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <ul>
        <li>
          <Link to="users" relative="path">
            Check our users 👥
          </Link>
        </li>
      </ul>
    </div>
  );
}
