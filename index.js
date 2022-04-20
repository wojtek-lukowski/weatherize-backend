import express from 'express';
import http from 'http';
// const express = require('express');
// const http = require('http');

const app = express();

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text-plain'});
  response.end('Weatherize backend\n');
}).listen(8080);

console.log('Weatherize backend running on port 8080');