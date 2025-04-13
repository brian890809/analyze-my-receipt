import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const db = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Save a new tag with usage count
const saveTag = async (tag, userId) => {
    const item = {
        tag: { S: tag.toLowerCase() },
        userId: { S: userId },
        count: { N: "1" },
        updatedAt: { N: Date.now().toString() }
    };

    const command = new PutItemCommand({
        TableName: "dish-tags",
        Item: item,
        ReturnValues: "ALL_OLD"
    });

    try {
        await db.send(command);
        return { success: true };
    } catch (error) {
        console.error("Error saving tag:", error);
        throw error;
    }
};

// Get tag suggestions (most used tags)
const getTagSuggestions = async () => {
    const params = {
        TableName: "dish-tags",
        Limit: 50,  // Get top 50 tags
    };

    const command = new ScanCommand(params);
    try {
        const result = await db.send(command);
        if (!result.Items) return [];
        // Unmarshall the items and sort them by count
        // return the top 10 tags sorted by count
        return result.Items.map(item => unmarshall(item)).sort((a, b) => b.count - a.count).slice(0, 10);
    } catch (error) {
        console.error("Error fetching tags:", error);
        throw error;
    }
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { tag, userId } = req.body;
            await saveTag(tag, userId);
            res.status(200).json({ message: "Tag saved successfully" });
        } catch (error) {
            res.status(500).json({ error: "Failed to save tag" });
        }
    } else if (req.method === "GET") {
        try {
            const tags = await getTagSuggestions();
            res.status(200).json(tags);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch tags" });
        }
    } else {
        res.setHeader("Allow", ["POST", "GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}