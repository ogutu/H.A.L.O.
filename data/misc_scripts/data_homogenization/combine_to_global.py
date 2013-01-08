#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import shutil

def get_arguments():
    '''
    Gets arguments from the command line
    @author: Daniel Lee
    @return: The command line arguments as a list
    '''
    
    import sys
    return sys.argv[1:]

def get_sat_names(year, day, hour, variable, satellites):
    '''
    Return: scan_names, a list of scans at the current time
        Order: GOES-W, GOES-E, Meteosat Prime, Meteosat IODC, GMS
    '''
    def current_hour(hour, satellite):
        if satellite == "goes12":
            hour = str(int(hour) - 1).zfill(2)
            if int(hour) < 0:
                return "23"
            return hour
        else:
            return hour
    
    def current_minute(satellite):
        if satellite == "goes12":
            return "45"
        elif satellite == "goes09":
            return "25"
        else:
            return "00"
    
    scan_names = []
    for satellite in satellites:
        scan_names.append(satellite + "." + year + "." + str(day) + "." + 
                          current_hour(hour, satellite) + 
                          current_minute(satellite) + variable + ".tif")
    return scan_names

def copy_files(input_folder, output_folder, scan_names):
    '''
    Tries to copy all files from input folder into output folder.
    If a file isn't present, it's skipped.
    '''
    os.chdir(input_folder)
    try:
        for scan in scan_names:
            print("Copying " + scan + "...")
            shutil.copyfile(scan, output_folder + "/" + scan)
    except:
        pass

def merge_images(output_folder, 
                 satellites, 
                 scan_names, 
                 year, day, 
                 hour, 
                 variable):
    '''
    Merges images using:
    gdal_merge.py ifile1 ifile2 -o mergedfile
    '''
    
    def get_merged_name(year, day, hour, variable):
        return ("all_sats." + 
                year + "." + 
                str(day) + "." + 
                hour + "00" + variable + ".tif")
    
    os.chdir(output_folder)
    # This counter ensures that even if a scan is missing, all remaining scans
    # are combined. If I use the scan number as a counter I get missing values.
    i = 0
    for scan in range(len(scan_names)):
        if scan > 0:
            try:
                os.system("gdal_merge.py " + 
                          "merge" + str(i - 1) + ".tif "
                          + scan_names[scan] + 
                          " -o merge" + str(i) + ".tif")
                i += 1
            except:
                pass
        else:
            try:
                shutil.copy(scan_names[i], "merge" + str(i) + ".tif")
                i += 1
            except:
                pass
    
    try:
        shutil.move("merge" + str(scan) + ".tif", 
                    get_merged_name(year, day, hour, variable))
    except:
        pass
    # Remove all raw satellite pictures and merge files
    search_list = list(satellites)
    search_list.append("merge")
    cleanup(search_list)
    return

def cleanup(search_strings):
    '''
    Deletes files in current directory based on search strings
    @var search_strings: A list of search strings
    '''
    import glob
    # Loop over search strings
    for s in search_strings:
        # Loop over files that match
        for f in glob.glob(s + "*"):
            # Remove them
            os.remove(f)

def main():
    # Get command line arguments
    args = get_arguments()
    input_folder = args[0]
    output_folder = args[1]
    variable = args[2]
    satellites = ["goes10", "goes12", "msat-p", "msat-i", "goes09"]
    year = "2003"
    
    for day in range(152, 182):
        for hour in range(0, 22, 3):
            hour = str(hour).zfill(2)
            scan_names = get_sat_names(year,
                                       day, 
                                       hour, 
                                       variable, 
                                       satellites)
            # Copy images to temp folder
            copy_files(input_folder, output_folder, scan_names)
            # Merge images
            merge_images(output_folder, 
                         satellites, 
                         scan_names, 
                         year, 
                         day, 
                         hour, 
                         variable)
    
if __name__ == '__main__':
    main()
