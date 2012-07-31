# 27.07.2012
# Author: Daniel Lee
# short_dl_file.py
# Purpose: Shorten the download file used to download imagery from NOAA by
# removing files found in a delete file.

# This file dcontains a lot of files to delete
delete_path = 'delete_gms3.txt'
# The first file originally contained 761 lines
download_path = 'download_gms2.txt'
output_path = 'download_gms3.txt'

# Read contents of delete_gms1.txt and append it to a list
delete_file = open(delete_path, 'r')
to_delete = delete_file.readlines()
delete_file.close()
# Remove line breaks from list
for i in range(len(to_delete)):
    to_delete[i] = to_delete[i].replace('\n', '')
#print('len(to_delete_sig) == ' + str(len(to_delete_sig)))
#print('len(to_delete_image) == ' + str(len(to_delete_image)))
print('len(to_delete) == ' + str(len(to_delete)))

download_file = open(download_path, 'r')
original_lines = download_file.readlines()
download_file.close()
print('len(original_lines) == ' + str(len(original_lines)))

delete = 0
keepers = []
for original_line in original_lines:
    examine_file = original_line[44:].replace('\n', '')
    if not examine_file in to_delete:
        keepers.append(original_line)

output_file = open(output_path, 'w')
for line in keepers:
    output_file.write(line)