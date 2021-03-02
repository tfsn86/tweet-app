const app = require('express')();

const faunadb = require('faunadb');
const client = new faunadb.Client({
	secret: 'fnAEDQWkstACAU6SDk0-dpsIbSQhhHVpxInb7MMH',
});

const {
	Ref,
	Paginate,
	Get,
	Match,
	Index,
	Create,
	Collection,
	Join,
	Call,
	Function: Fn,
} = faunadb.query;

app.get('/tweet/:id', async (req, res) => {
	const doc = await client.query(Get(Ref(Collection('tweets'), req.params.id)));

	res.send(doc);
});

app.post('/tweet', async (req, res) => {
	const data = {
		// Original code extracted to Fauna Function
		// user: Select('ref', Get(Match(Index('users_by_name'), 'Torben'))),
		user: Call(Fn('getUser'), 'Torben'),
		text: 'Torben kan også',
	};

	const doc = await client.query(Create(Collection('tweets'), { data }));

	res.send(doc);
});

app.get('/tweet', async (req, res) => {
	const docs = await client.query(
		Paginate(Match(Index('tweets_by_user'), Call(Fn('getUser'), 'Christina')))
	);

	res.send(docs);
});

app.post('/relationship', async (req, res) => {
	const data = {
		follower: Call(Fn('getUser'), 'Christina'),
		followee: Call(Fn('getUser'), 'Torben'),
	};
	const doc = await client.query(Create(Collection('relationships'), { data }));

	res.send(doc);
});

app.get('/feed', async (req, res) => {
	const docs = await client.query(
		Paginate(
			Join(
				Match(Index('followees_by_follower'), Call(Fn('getUser'), 'Torben')),
				Index('tweets_by_user')
			)
		)
	);

	res.send(docs);
});

app.listen(5000, () => console.log('API on http://localhost:5000'));
