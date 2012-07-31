#!/bin/bash

# Downloads all URLs in list_of_input_files.txt and saves them to work directory
aria2c -i list_of_input_files.txt -j16 -x16 -Z

# Upload.file to FTP server and delete from original computer
wput upload.file ftp://wet:ObserveAtmo@137.248.191.49/dlee/sat_data/ -R
