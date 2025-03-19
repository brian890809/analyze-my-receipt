const handler = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }    
    const invokationURL = process.env.INVOKATION_URL
    const type = "POST"
    const headers = { "Content-Type": "application/json" }
    const url = req.body.url
    const body = JSON.stringify({ fileUrl: url })
    try {
        const response = await fetch(invokationURL, { method: type, headers, body })
        const data = await response.json()
        res.status(response.status).json(data)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: "Failed to submit the URL. Please try again." })
    }
}

export default handler