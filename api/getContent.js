const https = require('https');

module.exports = async (req, res) => {
  const { filePath } = req.query;

  if (!filePath) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(400).json({ error: '파일 경로를 입력하세요.' });
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
        
        if (parsedData.name) {
          const title = parsedData.name;
          res.json({ title });
        } else {
          res.status(500).json({ error: '파일 제목을 읽을 수 없습니다.' });
        }
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