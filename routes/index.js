var express = require('express');
var fs = require('fs');
var zlib = require('zlib');
var { join } = require('path');
const stream = require('stream');

var router = express.Router();


router.get('/stream1/:vidId', (req, res, next) => {
  const range = req.headers.range;
  const { resolution } = req.query;
  let filePath;
  if (resolution === 'high') {
    filePath = join(__dirname, '..', '123456', 'music_high.mkv');
  } else {
    filePath = join(__dirname, '..', '123456', 'music_low.mkv');
  }
  const stats = fs.statSync(filePath);
  const { size } = stats;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split('-');
    const start = parseInt(parts[0]);
    const end = parts[1] ? parseInt(parts[1]) : size - 1;
    const chunkSize = (end - start) + 1;
    const movieStream = fs.createReadStream(filePath, { start, end });

    const head = {
      'Content-Range': `bytes ${start} - ${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-length': chunkSize,
      'Content-type': 'video/mp4',
    };

    res.writeHead(206, head);
    movieStream.pipe(res);
  } else {
    console.log('no range');
    res.send("aaaaaaaaaa");
  }

})

router.get('/stream/:vidId', (req, res, next) => {

  // console.log(join(__dirname, '..', '123456', 'test.mp4'))

  // return res.sendFile(join(__dirname, '..', '123456', 'test.mp4'))
  const filePath = join(__dirname, '..', '123456', 'vid.mp4')
  const movieStream = fs.createReadStream(filePath);
  const stats = fs.statSync(filePath);
  console.log(stats);
  console.log(req.headers.range)
  const compres = new stream.Transform({
    transform(chunk, enc, next) {
      const zippedChunk = chunk;
        this.push(zippedChunk)
      next();
    }
  })

  // res.status(206);
  res.setHeader("Content-Type", "video/mp4")
  movieStream.pipe(compres).pipe(res);

});

module.exports = router;
