docker run --network host -it -d -v `pwd`:/udpclient --name udpserver node:8.9.3-alpine node /udpclient/server.js
