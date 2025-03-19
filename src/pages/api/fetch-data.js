import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
  region: process.env.AWS_REGION, // Use region from env
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const params = {
    TableName: 'receipt-entries', // Replace with your DynamoDB table name
  };

  try {
    const command = new ScanCommand(params);
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