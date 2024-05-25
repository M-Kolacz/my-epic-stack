import { json } from "@remix-run/node";
import { requireUserId } from "./auth.server";
import { prisma } from "./db.server";
import { PermissionString, Role, parsePermissionString } from "./user";

export const requireUserWithPermission = async (
  request: Request,
  permission: PermissionString
) => {
  const userId = await requireUserId(request);
  const permissionData = parsePermissionString(permission);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      roles: {
        some: {
          permissions: {
            some: {
              ...permissionData,
              access: permissionData.access
                ? { in: permissionData.access }
                : undefined,
            },
          },
        },
      },
    },
    select: { id: true },
  });

  if (!user) {
    throw json(
      {
        error: "Unauthorized",
        requiredPermission: permissionData,
        message: `Unauthorized: required permissions: ${permission}`,
      },
      { status: 403 }
    );
  }

  return user.id;
};

export const requireUserWithRole = async (request: Request, role: Role) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: {
      id: userId,
      roles: {
        some: {
          name: role,
        },
      },
    },
  });

  if (!user) {
    throw json(
      {
        error: "Unauthorized",
        requiredRole: role,
        message: `Unauthorized: required role: ${role}`,
      },
      { status: 403 }
    );
  }

  return user.id;
};
