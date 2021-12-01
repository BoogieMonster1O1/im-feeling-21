import {MongoClient} from "mongodb";

let dbClient: MongoClient;

const Db = {
	async getClient(): Promise<MongoClient| null> {
		// if(!process.env['?MONGO_URI']) {
		// 	throw new Error("MongoDB URI is missing");
		// }

		if (!dbClient) {
			dbClient = await MongoClient.connect(process.env['MONGO_URI']!);
		}

		return dbClient;
	},
}

export default Db;
