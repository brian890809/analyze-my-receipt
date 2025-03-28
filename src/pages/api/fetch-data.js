import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const userId = req.body.userId
  const params = {
    TableName: 'receipt-entries', // TODO: Replace with a new table with userId as the partition key
    IndexName: 'userId-index',
    KeyConditionExpression: "userId = :userIdValue",
    ExpressionAttributeValues: {
      ":userIdValue": { S: userId }, // Assuming userId is a string
    },
  };

  try {
    const command = new QueryCommand(params);
    const {Items} = await db.send(command); // Send the command to the database
    const cleaned = Items.map((item) => {
      const unmarshalledItem = unmarshall(item)
      const str = unmarshalledItem["merchant#time"]
      const merchant = str.split("#")[0]
      const time = str.split("#")[1] 
      return {
        ...unmarshalledItem,
        merchant: merchant,
        time: time,
        grandTotal: unmarshalledItem.total + unmarshalledItem.tax + unmarshalledItem.tip
      }
    })
    res.status(200).json(cleaned);
  } catch (error) {
    console.error('Error fetching data from DynamoDB:', error);
    const errorMessage = error.message || 'Error fetching data from DynamoDB';
    res.status(500).json({ error: errorMessage });
  }
}