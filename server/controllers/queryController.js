import genAI from '../utils/openaiConfig.js'

class QueryController{

static handleQuery = async (req, res) => {
  try {
    const { userQuery } = req.body;
    if (!userQuery) {
      return res.status(400).json({ message: "Query is required." });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, { apiVersion: 'v1' });    
    const response = await model.generateContent(userQuery);
    const textResponse = response.response.text();

    // Convert response into Markdown format for better structuring
    const formattedResponse = `**Response:**\n\n${textResponse}`;

    res.json({ response: formattedResponse });
  } catch (error) {
    console.error("AI Query Error:", error);
    res.status(500).json({ message: "Error processing query" });
  }
};


}


export default QueryController;
