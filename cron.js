var http = require('http');
(() => {
  http.get({
    host: 'localhost',
    port: 3000,
    path: '/api/v1/user/cronApi'
  }, function (resp) { })

  http.get({
    host: 'localhost',
    port: 3000,
    path: '/api/v1/user/cronApi1'
  }, function (resp) { })

  http.get({
    host: 'localhost',
    port: 3000,
    path: '/api/v1/user/cronApi2'
  }, function (resp) { })

  http.get({
    host: 'localhost',
    port: 3000,
    path: '/api/v1/user/cronApi3'
  }, function (resp) { })
})()