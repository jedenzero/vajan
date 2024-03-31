const https = require('https');

module.exports = async (req, res) => {
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

  let data = '';

  const request = https.request(options, (response) => {
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        const fileNames = parsedData.map(file => file.name);
        res.json({ fileNames });
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
