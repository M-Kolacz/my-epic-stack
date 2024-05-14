import { useRouteLoaderData } from "@remix-run/react";
import { type loader as rootLoader } from "#app/root";

export const useOptionalUser = () => {
  const rootData = useRouteLoaderData<typeof rootLoader>("root");

  return rootData?.user ?? null;
};

export const useUser = () => {
  const maybeUser = useOptionalUser();

  if (!maybeUser) {
    throw new Error(
      "User not found! If user is optional then use useOptionalUser instead."
    );
  }

  return maybeUser;
};

export const action = ["create", "read", "update", "delete"] as const;
export const entity = ["user", "note"] as const;
export const access = ["own", "any", "own,any", "any,own"] as const;
export const role = ["admin", "user"] as const;

export type Action = (typeof action)[number];
export type Entity = (typeof entity)[number];
export type Access = (typeof access)[number];
export type Role = (typeof role)[number];
export type PermissionString =
  | `${Action}:${Entity}`
  | `${Action}:${Entity}:${Access}`;

export const parsePermissionString = (permissionString: PermissionString) => {
  const [action, entity, access] = permissionString.split(":") as [
    Action,
    Entity,
    Access | undefined,
  ];

  return {
    action,
    entity,
    access: access
      ? (access.split(",") as Array<Extract<Access, "own" | "any">>)
      : undefined,
  };
};

export const userHasPermission = (
  user: Pick<ReturnType<typeof useUser>, "roles"> | null,
  permission: PermissionString
) => {
  if (!user) return false;
  const { access, action, entity } = parsePermissionString(permission);
  return user.roles.some((role) =>
    role.permissions.some(
      (permission) =>
        action === permission.action &&
        entity === permission.entity &&
        (!access || access.includes(permission.access))
    )
  );
};

export const userHasRole = (
  user: Pick<ReturnType<typeof useUser>, "roles"> | null,
  role: Role
) => {
  if (!user) return false;
  return user.roles.some((userRole) => userRole.name === role);
};
