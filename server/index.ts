import 'dotenv/config';
import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import { ServerBuild } from '@remix-run/node';
import getPort, { portNumbers } from 'get-port';
import chalk from 'chalk';
import { ip as getIpAddress } from 'address';
import closeWithGrace from 'close-with-grace';

const MODE = process.env.NODE_ENV ?? 'development';

const IS_PROD = MODE === 'production';
const IS_DEV = MODE === 'development';

const viteDevServer = IS_PROD
	? undefined
	: await import('vite').then((vite) =>
			vite.createServer({
				server: { middlewareMode: true },
			}),
		);

const app = express();

// no ending slashes for SEO reasons
// https://github.com/epicweb-dev/epic-stack/discussions/108
app.get('*', (req, res, next) => {
	if (req.path.endsWith('/') && req.path.length > 1) {
		const query = req.url.slice(req.path.length);
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/');
		res.redirect(301, safepath + query);
	} else {
		next();
	}
});

if (viteDevServer) {
	app.use(viteDevServer.middlewares);
} else {
	// Remix fingerprints its assets so we can cache forever.
	app.use(
		'/assets',
		express.static('build/client/assets', {
			immutable: true,
			maxAge: '1y',
		}),
	);
	// Everything else (like favicon.ico) is cached for an hour. You may want to be
	// more aggressive with this caching.
	app.use(express.static('build/client', { maxAge: '1h' }));
}

const getBuild = async () => {
	const build = viteDevServer
		? viteDevServer.ssrLoadModule('virtual:remix/server-build')
		: // @ts-ignore this should exist before running the server
			// but it may not exist just yet.
			await import('../build/server/index.js');
	// not sure how to make this happy 🤷‍♂️
	return build as unknown as ServerBuild;
};

app.all(
	'*',
	createRequestHandler({
		getLoadContext: (_: any, res: any) => ({
			cspNonce: res.locals.cspNonce,
			serverBuild: getBuild(),
		}),
		mode: MODE,
		build: getBuild,
	}),
);

const desiredPort = Number(process.env.PORT || 3000);
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
});
const portAvailable = desiredPort === portToUse;
if (!portAvailable && !IS_DEV) {
	console.log(chalk.red(`🚫 Port ${desiredPort} is not available.`));
	process.exit(1);
}

const server = app.listen(portToUse, () => {
	if (!portAvailable) {
		console.warn(
			chalk.yellow(
				`⚠️  Port ${desiredPort} is not available, using ${portToUse} instead.`,
			),
		);
	}

	console.log(`🚀 We have liftoff!`);
	const localUrl = `http://localhost:${portToUse}`;
	let lanUrl: string | null = null;
	const localIp = getIpAddress() ?? 'Unknown';
	// Check if the address is a private ip
	// https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
	// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
	if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
		lanUrl = `http://${localIp}:${portToUse}`;
	}

	console.log(
		`
${chalk.bold('🖥️  Local:')}            ${chalk.cyan(localUrl)}
${lanUrl ? `${chalk.bold('🌐 On Your Network:')}   ${chalk.cyan(lanUrl)}` : ''}
${chalk.bold('Press Ctrl+C to stop')}
		`.trim(),
	);
});

closeWithGrace(async () => {
	await new Promise((resolve, reject) => {
		server.close((error) => (error ? reject(error) : resolve('ok')));
	});
});
