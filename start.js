import fs from "fs";
import { spawn } from "child_process";
import os from "os";
import path from "path";

async function go() {
  await exec("npx prisma migrate deploy");

  console.log("Starting app...");
  await exec("remix-serve ./build/server/index.js");
}
go();

async function exec(command) {
  const child = spawn(command, { shell: true, stdio: "inherit" });
  await new Promise((res, rej) => {
    child.on("exit", (code) => {
      if (code === 0) {
        res();
      } else {
        rej();
      }
    });
  });
}
