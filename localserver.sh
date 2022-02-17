#!/bin/bash
echo $'Platypus App - Python3 Local http.server             Local app started               Browser should open automatically or visit localhost:9000 to start application              Close this window to stop application.'
python3 -m http.server 9000 &
open "http://localhost:9000"
