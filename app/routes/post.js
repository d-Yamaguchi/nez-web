///<reference path='../../typings/node/node.d.ts'/>
///<reference path='../../typings/express/express.d.ts'/>
var express = require('express');
var router = express.Router();
var http = require('../helper/post');
var config = require('config');
var exec = require('child_process').exec;
var fs = require('fs');
var tmp = require('tmp');
var path = require('path');
var nez_command = config.nez.env + ' java -jar ' + config.nez.path + ' ' + config.nez.option + ' ';
function genResponse(res, j) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(j));
    res.end('\n');
}
function createFileAndExec(src_tempfile, source, p4d_tempfile, p4d, command, callback) {
    fs.writeFileSync(src_tempfile, source);
    fs.writeFileSync(p4d_tempfile, p4d);
    exec(command, function (out) {
        callback(out);
    });
}
router.post('/run', function (req, res) {
    //dest server is configured by default.yaml
    var client_body = req.body;
    console.log(client_body);
    tmp.file({ prefix: 'nez', postfix: '.p4d' }, function (p4d_err, p4d_tempfile, fd) {
        if (p4d_err) {
            console.log(p4d_err);
            return;
        }
        tmp.file({ prefix: 'nez' }, function (src_err, src_tempfile, fd) {
            if (src_err) {
                console.log(src_err);
                return;
            }
            var dest_file = src_tempfile + '_rev.txt';
            var exec_command = nez_command + ' -p ' + p4d_tempfile + ' ' + src_tempfile + ' > ' + dest_file;
            console.log(exec_command);
            createFileAndExec(src_tempfile, req.body.source, p4d_tempfile, req.body.p4d, exec_command, function (stdout) {
                var data = fs.readFileSync(dest_file);
                if (data.length > 0) {
                    var j = { source: data.toString(), runnable: true };
                    genResponse(res, j);
                }
                else {
                    var msg = "エラー訂正候補を出せませんでした";
                    var error_j = { source: msg, runnable: false };
                    genResponse(res, error_j);
                }
            });
        });
    });
});
router.post('/visualize', function (req, res) {
    //dest server is configured by default.yaml
    var client_body = req.body;
    console.log(client_body);
    tmp.file({ prefix: 'nez', postfix: '.p4d' }, function (p4d_err, p4d_tempfile, fd) {
        if (p4d_err) {
            console.log(p4d_err);
            return;
        }
        tmp.file({ prefix: 'nez' }, function (src_err, src_tempfile, fd) {
            if (src_err) {
                console.log(src_err);
                return;
            }
            var dest_file = src_tempfile + '_rev.txt';
            var exec_command = nez_command + ' -p ' + p4d_tempfile + ' -t json ' + src_tempfile + ' > ' + dest_file;
            console.log(exec_command);
            createFileAndExec(src_tempfile, req.body.source, p4d_tempfile, req.body.p4d, exec_command, function (stdout) {
                var data = fs.readFileSync(dest_file);
                if (data.length > 0) {
                    var j = { source: data.toString(), runnable: true };
                    genResponse(res, j);
                }
                else {
                    var msg = "エラー訂正候補を出せませんでした";
                    var error_j = { source: msg, runnable: false };
                    genResponse(res, error_j);
                }
            });
        });
    });
});
router.post('/dummy/run', function (req, res) {
    console.log(req);
    var ret = {
        //src: "#include<stdio.h>\n\nint main() {\n\tprintf(\"hello\n\");\n}\n",
        output: "parse result"
    };
    res.json(ret);
});
module.exports = router;
