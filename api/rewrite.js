export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: '只支持POST请求' });

  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) return res.status(500).json({ error: '未配置API Key' });

  const { messages, system } = req.body;

  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: system || '你是专业的小红书内容运营专家。严格按JSON格式输出，不含任何额外文字或markdown标记。' },
          ...messages
        ]
      })
    });
    const data = await response.json();
    return res.status(200).json({
      content: [{ text: data.choices[0].message.content }]
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
