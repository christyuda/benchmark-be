/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
// 		return new Response('Hello World!');
// 	},
// };

import { Router } from 'itty-router';
import * as Realm from 'realm-web';

const router = Router();

// Replace 'application-0-ecvmjju' with your actual MongoDB App ID
const app = new Realm.App({ id: 'application-0-ecvmjju' });

const getBenchmarks = async (request: Request): Promise<Response> => {
	try {
	  const apiKey = request.headers.get('Authorization');
	  if (!apiKey) return new Response('Missing API Key', { status: 401 });

	  const credentials = Realm.Credentials.apiKey(apiKey);
	  const user = await app.logIn(credentials);
	  const mongodb = user.mongoClient('mongodb-atlas');
	  const benchmarksCollection = mongodb.db('cloudflare').collection('benchmarks');

	  const benchmarks = await benchmarksCollection.find();
	  return new Response(JSON.stringify(benchmarks), { status: 200 });
	} catch (error) {
	  return new Response(`Error: ${(error as Error).message}`, { status: 500 });
	}
  };

  const postBenchmark = async (request: Request): Promise<Response> => {
	try {
	const apiKey = request.headers.get('Authorization');
	if (!apiKey) return new Response('Missing API Key', { status: 401 });

	const credentials = Realm.Credentials.apiKey(apiKey);
	const user = await app.logIn(credentials);
	const mongodb = user.mongoClient('mongodb-atlas');
	const benchmarksCollection = mongodb.db('cloudflare').collection('benchmarks');

	const benchmark = await request.json();
	const result = await benchmarksCollection.insertOne({
		owner_id: user.id,
		benchmark,
	});

	  return new Response(JSON.stringify(result), { status: 201 });
	} catch (error) {
		return new Response(`Error: ${(error as Error).message}`, { status: 500 });
	}
  };

  // Define the Worker logic
  router.get('/benchmarks', getBenchmarks);
  router.post('/benchmarks', postBenchmark);

  // Event listener for handling requests
  addEventListener('fetch', (event) => {
	event.respondWith(router.handle(event.request));
  });
