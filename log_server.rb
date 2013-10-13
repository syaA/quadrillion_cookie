#!/bin/env ruby

require 'webrick'

logfilename = 'log.txt'

s = WEBrick::HTTPServer.new(
  {:BindAddress => '127.0.0.1',
   :Port => 20080});

trap(:INT){s.shutdown}

s.mount_proc('/append_log') { |req, res|
  res['Access-Control-Allow-Origin'] = '*';
  res.body = 'ok'
  open(logfilename, 'a') { |f|
    f.puts("#{req.query['bakedCookie']}, #{req.query['curCookie']}, #{req.query['curCps']}");
  }
}

s.start
