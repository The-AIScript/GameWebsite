var httpProxy = require('http-proxy');
var options = {
  router: {
    '.*': '127.0.0.1:9000',
    'script.ai/api': '127.0.0.1:3002',
  }
};

var proxyServer = httpProxy.createServer(options);
proxyServer.listen(80);

