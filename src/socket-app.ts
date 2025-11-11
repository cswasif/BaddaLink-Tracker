/**
 * Copyright 2019 Novage LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-console */

import { readFileSync } from "fs";
import { UWebSocketsTracker, UwsConnectionContext } from "./uws-tracker.js";
import { Tracker } from "./tracker.js";
import { Settings } from "./settings.js";
import { buildUwsTracker } from "./build-uws-tracker.js";

export async function runSocketApp(
  tracker: Tracker<UwsConnectionContext>,
  settings: Settings,
): Promise<void> {
  let indexHtml: Buffer | undefined = undefined;

  try {
    indexHtml = readFileSync("index.html");
  } catch (e) {
    if ((e as { code?: string }).code !== "ENOENT") {
      throw e;
    }
  }

  const servers: UWebSocketsTracker[] = [];

  const getServersStats = async () => {
    return Promise.resolve(
      servers.map((server, index) => ({
        server: `${settings.servers[index].server?.host ?? "0.0.0.0"}:${settings.servers[index].server?.port ?? 8000}`,
        webSocketsCount: server.stats.webSocketsCount,
      })),
    );
  };

  const serverPromises = settings.servers.map(async (serverSettings) => {
    // Use PORT environment variable if available (Railway requirement)
    const port = process.env.PORT ? parseInt(process.env.PORT) : (serverSettings.server?.port ?? 8000);
    const host = serverSettings.server?.host ?? "0.0.0.0";
    
    console.info(`Starting server on ${host}:${port} (PORT env: ${process.env.PORT || 'not set'})`);
    
    const modifiedSettings = {
      ...serverSettings,
      server: {
        ...serverSettings.server,
        port,
        host
      }
    };
    
    const server = buildUwsTracker({
      tracker,
      serverSettings: modifiedSettings,
      websocketsAccess: settings.websocketsAccess,
      indexHtml,
      getServersStats,
    });
    servers.push(server);
    await server.run();
    console.info(
      `✅ Server listening on ${host}:${port}`,
    );
  });

  await Promise.all(serverPromises);
}
