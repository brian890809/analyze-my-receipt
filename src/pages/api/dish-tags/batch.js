import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Save a batch of tags
const saveTagsBatch = async (tags) => {
    // Process each tag individually
    const savePromises = tags.map(({ tag, userId }) => {
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

        return db.send(command);
    });

    try {
        // Execute all tag saves in parallel
        await Promise.all(savePromises);
        return { success: true, count: tags.length };
    } catch (error) {
        console.error("Error saving tags batch:", error);
        throw error;
    }
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { tags } = req.body;
            
            if (!tags || !Array.isArray(tags) || tags.length === 0) {
                return res.status(400).json({ error: "Invalid tags data. Expected non-empty array." });
            }
            
            const result = await saveTagsBatch(tags);
            res.status(200).json({ message: `Successfully saved ${result.count} tags` });
        } catch (error) {
            console.error("API error:", error);
            res.status(500).json({ error: "Failed to save tags batch" });
        }
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 