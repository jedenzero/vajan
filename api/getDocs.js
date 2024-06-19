const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/jedenzero/vajan/contents/documents',
    method: 'GET',
    headers: {
      'Authorization': `token ${process.env.vajan_docs}`,
      'User-Agent': 'node.js'
    }
  };

  let data = [];
  const request = https.request(options, (response) => {
    response.setEncoding('utf8');
    
    response.on('data', (chunk) => {
      data.push(Buffer.from(chunk, 'utf8'));
    });

    response.on('end', () => {
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).json({ error: `GitHub API 오류: ${response.statusCode}` });
      }

      try {
        const fullData = Buffer.concat(data).toString('utf8');
        const parsedData = JSON.parse(fullData);
        const fileNames = parsedData.map(file => decodeURIComponent(file.name));
        res.json({ fileNames });
      } catch (error) {
        res.status(500).json({ error: '파싱 에러', details: error.message });
      }
    });
  });

  request.on('error', (error) => {
    res.status(500).json({ error: '서버 오류', details: error.message });
  });

  request.end();
};
