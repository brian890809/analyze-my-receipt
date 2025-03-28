import { DynamoDBClient, BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";


const db = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})
const tbName = 'UserEmails'
const BATCH_SIZE = 25

const handler = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const {userId, emails} = req.body

    const items = emails.flatMap((email) => [
        {PutRequest: {Item: {uidOrEmail: {S: `EMAIL#${email}`}, emailOrUid: {S: `USER#${userId}`}}}},
        {PutRequest: {Item: {uidOrEmail: {S: `USER#${userId}`}, emailOrUid: {S: `EMAIL#${email}`}}}}
    ])

    try {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE);
            const command = new BatchWriteItemCommand({
                RequestItems: { [tbName]: batch }
            });
    
            await db.send(command);
        }
        console.log(`Successfully added ${emails.length} emails for user ${userId}`);
        res.status(201).json({
            message: `Emails added to the database in ${Math.ceil(i / BATCH_SIZE)} batch(es)`
        })
    } catch (e) {
        console.error('An error as occurred. Error message: ', e)
        res.status(500).json({
            error: "Failed to add emails.",
            errorMsg: e
        })
    }
}

export default handler