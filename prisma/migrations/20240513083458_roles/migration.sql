-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");


---------------------------------------- MANUAL MIGRATION ----------------------------------------

-- Insert roles
INSERT INTO Role VALUES('clw4r3ufi000gysxm7lf59rqk','admin','',1715591874510,1715591874510);
INSERT INTO Role VALUES('clw4r3ufm000hysxm56drhvc4','user','',1715591874514,1715591874514);

-- Insert permissions
INSERT INTO Permission VALUES('clw4r3ue40000ysxm2d2a1npe','create','user','own','',1715591874460,1715591874460);
INSERT INTO Permission VALUES('clw4r3ue80001ysxmnbqvaeux','create','user','any','',1715591874465,1715591874465);
INSERT INTO Permission VALUES('clw4r3uec0002ysxmc00h60je','read','user','own','',1715591874468,1715591874468);
INSERT INTO Permission VALUES('clw4r3uef0003ysxmt4qzic7r','read','user','any','',1715591874471,1715591874471);
INSERT INTO Permission VALUES('clw4r3ueh0004ysxmf0qpvugv','update','user','own','',1715591874474,1715591874474);
INSERT INTO Permission VALUES('clw4r3uek0005ysxm9csti9c2','update','user','any','',1715591874477,1715591874477);
INSERT INTO Permission VALUES('clw4r3uen0006ysxm7o6ubd82','delete','user','own','',1715591874480,1715591874480);
INSERT INTO Permission VALUES('clw4r3ueq0007ysxm1eolpfr0','delete','user','any','',1715591874483,1715591874483);
INSERT INTO Permission VALUES('clw4r3uet0008ysxm69sdjfly','create','note','own','',1715591874486,1715591874486);
INSERT INTO Permission VALUES('clw4r3uew0009ysxmln0smc11','create','note','any','',1715591874489,1715591874489);
INSERT INTO Permission VALUES('clw4r3uez000aysxmr2vgz88q','read','note','own','',1715591874492,1715591874492);
INSERT INTO Permission VALUES('clw4r3uf2000bysxmxk0ujoci','read','note','any','',1715591874495,1715591874495);
INSERT INTO Permission VALUES('clw4r3uf5000cysxmx9uf29iq','update','note','own','',1715591874497,1715591874497);
INSERT INTO Permission VALUES('clw4r3uf8000dysxmp6u352zi','update','note','any','',1715591874500,1715591874500);
INSERT INTO Permission VALUES('clw4r3ufb000eysxmlaxmnedr','delete','note','own','',1715591874503,1715591874503);
INSERT INTO Permission VALUES('clw4r3ufe000fysxm3ebgzsc9','delete','note','any','',1715591874506,1715591874506);

INSERT INTO _PermissionToRole VALUES('clw4r3ue80001ysxmnbqvaeux','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3uef0003ysxmt4qzic7r','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3uek0005ysxm9csti9c2','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3ueq0007ysxm1eolpfr0','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3uew0009ysxmln0smc11','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3uf2000bysxmxk0ujoci','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3uf8000dysxmp6u352zi','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3ufe000fysxm3ebgzsc9','clw4r3ufi000gysxm7lf59rqk');
INSERT INTO _PermissionToRole VALUES('clw4r3ue40000ysxm2d2a1npe','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3uec0002ysxmc00h60je','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3ueh0004ysxmf0qpvugv','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3uen0006ysxm7o6ubd82','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3uet0008ysxm69sdjfly','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3uez000aysxmr2vgz88q','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3uf5000cysxmx9uf29iq','clw4r3ufm000hysxm56drhvc4');
INSERT INTO _PermissionToRole VALUES('clw4r3ufb000eysxmlaxmnedr','clw4r3ufm000hysxm56drhvc4');