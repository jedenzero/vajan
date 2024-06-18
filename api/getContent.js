const https = require('https');

module.exports = async (req, res) => {
  const { filePath } = req.query;

  if (!filePath) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(400).json({ error: '파일 경로' });
  }

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: `/repos/jedenzero/vajan/contents/${encodeURIComponent(filePath)}?ref=main`,
    method: 'GET',
    headers: {
      'Authorization': `token ${process.env.vajan_docs}`,
      'User-Agent': 'node.js'
    }
  };

  let data = '';

  const request = https.request(options, (response) => {
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        const parsedData = JSON.parse(data);
        const content = Buffer.from(parsedData.content, 'base64').toString('utf8');
        res.json({ content });
      } catch (error) {
        res.status(500).json({ error: '파싱 에러' });
      }
    });
  });

  request.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  request.end();
};
