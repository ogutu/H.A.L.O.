#!/usr/bin/env python
# -*- coding: utf-8 -*-


import os
    
def get_arguments():
    '''
    Gets arguments from the command line
    @author: Daniel Lee
    @return: The command line arguments as a list
    '''
    
    import sys
    return sys.argv[1:]

def get_scan_name(file):
    '''
    Gets the name of a satellite scan by examining its file name
    @author: Daniel Lee
    @param file: The file to extract scan name from
    @return: The scan name
    '''
    
    # Split file name by periods
    file_components = file.split(".")
    # Remove file ending
    scan_components = file_components[:-1]
    # Restore periods and return
    return ".".join(scan_components)

def get_file_names(scan_name, file_endings):
    '''
    Generates file names from a scan name
    @author: Daniel Lee
    @param scan_name: The name of the scan
    @param file_endings: A list of all file endings that should be generated
    for the scan
    '''
    
    file_list = []
    for end in file_endings:
        file_list.append(scan_name + end)
    return file_list

def xpif_to_idrisi(xpif, 
                   idrisi, 
                   columns,
                   rows,
                   west,
                   east,
                   south,
                   north):
    '''
    Converts an XPIF file to an Idrisi file
    @author: Daniel Lee
    @param xpif: The XPIF filename
    @param idrisi: The Idrisi filename
    @param columns: Number of columns in file
    @param rows: Number of rows in file
    @param west: The file's west border
    @param east: The file's east border
    @param south: The file's south border
    @param north: The file's north border
    '''
    
    def truncate_file(truncate_file, 
                      truncate_bits,
                      output_file):
        '''
        Truncates a file by a given number of bits.
        @author: Daniel Lee
        @param truncate_file: The file to truncate
        @param truncate_bits: The number of bits to truncate from the file's 
            begin
        @param output_file: The output file 
        '''
        
        # Open input file
        with open(truncate_file, "rb") as f:
            # Skip to bit to truncate from
            f.seek(truncate_bits)
            # Dump rest into memory
            output = f.read()
        # Open output file
        with open(output_file, "wb") as f:
            # Write to output file
            f.write(output)
    
    def write_idrisi_header(idrisi,
                            columns,
                            rows,
                            west,
                            east,
                            south,
                            north):
        '''
        Write an Idrisi header file
        @author: Daniel Lee
        @param idrisi: The Idrisi filename
        @param columns: Number of columns in file
        @param rows: Number of rows in file
        @param west: The file's west border
        @param east: The file's east border
        @param south: The file's south border
        @param north: The file's north border
        '''
        
        # Generate rdc filename
        header_file = get_scan_name(idrisi) + ".rdc"
        with open(header_file, "w") as f:
            f.write(
'''***********

file format : IDRISI Raster A.1
file title  : Former XPIF file
data type   : byte
file type   : binary
'''
            )
            f.write("columns     : " + str(columns) + "\n")
            f.write("rows        : " + str(rows) + "\n")
            f.write(
'''ref. system : plane
ref. units  : m
unit dist.  : 1.0000000
'''                    
                    )
            f.write("min. X      : " + str(west) + "\n")
            f.write("max. X      : " + str(east) + "\n")
            f.write("min. Y      : " + str(south) + "\n")
            f.write("max. Y      : " + str(north) + "\n")
            f.write(
'''pos`n error : unknown
resolution  : unknown
min. value  : 0
max. value  : 255
display min : 0
display max : 255
value units : unspecified
value error : unknown
flag value  : none
flag def`n  : none
legend cats : 0

*************
'''
            )
            

    
    # Truncate file by 256 byte
    truncate_file(xpif, 256, idrisi)
    # Write Idrisi header
    write_idrisi_header(idrisi,
                        columns,
                        rows,
                        west,
                        east,
                        south,
                        north)

def idrisi_to_geotiff(idrisi, geotiff):
    '''
    @author: Daniel Lee
    @param idrisi: The Idrisi filename
    @param geotiff: The GeoTiFF filename
    '''
    os.system('gdal_translate -a_srs "EPSG:4326" ' + idrisi + ' ' + geotiff)

def remove(files):
    '''
    Removes a file from the disc
    @author: Daniel Lee
    @param files: A list of files to be removed 
    '''
    
    for filename in files:
        os.remove(filename)

def main():
    '''
    Converts an XPIF file provided as a command line argument to a GeoTiFF
    with a name provided as the command line's second argument.
    @note: This program is meant to operate on data in the current directory.
    @author Daniel Lee
    '''
    
    # Get command line arguments
    args = get_arguments()
    input_file = args[0]
    output_file = args[1]
    # TODO: Get projection parameters from user (n-s-e-w, etc.)
    file_endings = [".XPIF", ".rst", ".tif"]
    
    # Get scan name
    scan_name = get_scan_name(input_file)
    # Generate file names
    file_names = get_file_names(scan_name, file_endings)
    xpif, rst, geotiff = file_names[0], file_names[1], file_names[2]
    # Convert XPIF to Idrisi
    xpif_to_idrisi(xpif, idrisi)
    # Convert Idrisi file to GeoTiFF
    idrisi_to_geotiff(idrisi, geotiff)
    # Remove old files
    remove([xpif, idrisi])

if __name__ == '__main__':
    main()
