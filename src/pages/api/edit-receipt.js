import { DynamoDBClient, UpdateItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
  region: process.env.AWS_REGION, // Use region from env
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const getItemByUUID = async (uuid) => {
    const params = {
        TableName: "receipt-entries",
        IndexName: "uuid-index",
        KeyConditionExpression: "#uuid = :uuidValue",
        ExpressionAttributeNames: {
            "#uuid": "uuid", // Map the alias to the actual attribute name
        },
        ExpressionAttributeValues: {
          ":uuidValue": { S: uuid },
        },
    };
    const command = new QueryCommand(params);
    try {
        const result = await db.send(command);
        return result.Items?.[0]; // Returns the first matched item
    } catch (error) {
        console.error("Error querying item by UUID:", error);
    }

}

const handler = async (req, res) => {
    if (req.method !== 'PUT') {
        res.setHeader("Allow", ["PUT"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    const data = unmarshall(JSON.parse(req.body))
    const { uuid, ...updates } = data
    delete updates["merchant#time"];
    const existingItem = unmarshall(await getItemByUUID(uuid));
    if (!existingItem) {
        res.status(404).json({ error: `Item with UUID ${uuid} not found` });
        return;
    }

    const { date, "merchant#time": merchantTime } = existingItem;
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    let index = 0;
    for (let [key, value] of Object.entries(updates)) {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);

        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] =
        typeof value === "number" ? { N: String(value) } :
        typeof value === "string" ? { S: value } :
        Array.isArray(value)
            ? { L: value.map((item) => ({ S: item })) }
            : { M: value };

        index++;
    }

    if (updateExpressions.length === 0) {
        console.log("No updates to apply.");
        return;
    }
    const params = {
        TableName: 'receipt-entries', // TODO: replace with a new table
        Key: {
            date: { S: date },
            "merchant#time": { S: merchantTime },
        },
        UpdateExpression: "SET " + updateExpressions.join(", "),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
    };
    try {
        const command = new UpdateItemCommand(params);
        const result = await db.send(command); // Send the command to the database
        res.status(200).json("Item updated successfully", result);
      } catch (error) {
        console.error('Error fetching data from DynamoDB:', error);
        const errorMessage = error.message || 'Error fetching data from DynamoDB';
        res.status(500).json({ error: errorMessage });
      }
}

export default handler