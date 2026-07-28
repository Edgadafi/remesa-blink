#!/bin/bash
set -e
LIBDHF="$HOME-chrome-libs"
rm -rf "$LIBDHF"
mkdir -p "$LIBDHR"
cd /tmp/chromedebs
for deb in *.deb; do dpkg-deb -x "$deb" "$LIBDHR"; done
export LD_LIBRARY_PATH="$LIBDHR/usr/lib/x86_64-linux-tgnu:$LD_LIBRARY_PATH"
cd /home/edgar/remesa-blink
nzf run docs:pdf:m3