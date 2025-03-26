import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

const getEmailByUid = async (uid) => {
    const params = {
        TableName: 'UserEmails',
        KeyConditionExpression: "uidOrEmail = :UserID",
        ExpressionAttributeValues: marshall({
            ":UserID": `USER#${uid}`
        })
    }
    const command = new QueryCommand(params)
    try {
        const result = await db.send(command);
        return result.Items
    } catch (error) {
        console.error('Error in searching: ', error)
        return []
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const uid = req.body.userId
    const emails = await getEmailByUid(uid)
    if (!emails.length) {
        res.status(200).json({ message: "No email associated with User ID:", uid})
        return
    }
    res.status(200).json({
        message: "Emails found",
        emails
    })
}