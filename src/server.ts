import express from 'express';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
app.use(express.json());

app.post('/api/chat', async (req, res) => {


  try {
    const { messages } = req.body as {
      messages: Groq.Chat.Completions.ChatCompletionMessageParam[];
    };
    const content = await client.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    messages
  });
    console.log('Stop reason:', content.choices[0]?.finish_reason);
    res.json({content: content.choices[0]?.message.content});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fallo al llamar al modelo' });
  }
});

app.listen(3000, () => console.log('API en http://localhost:3000'));