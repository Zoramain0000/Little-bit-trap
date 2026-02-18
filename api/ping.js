export default function handler(req, res) {
  res.status(200).json({ 
    status: 'alive', 
    platform: 'Vercel Live',
    apis: 17 
  });
}