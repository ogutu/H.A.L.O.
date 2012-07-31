# 27.07.2012
# Author: Daniel Lee
# short_dl_file.py
# Purpose: Shorten the download file used to download imagery from NOAA by
# removing files found in a delete file.

class SatelliteViews(object):
    '''
    A class to generate a list of satellite views for a given time space from
    a specified geostationary satellite. It can read a list of already
    downloaded data and compare that with the data that should be downloaded.
    '''
    
    def __init__(self, position, month=6, year=2003):
        '''
        Initializes framework for generating file names of views generated
        by the satellite in question during the specified time period.
        '''
        
        self.position = position
        self.month = month
        self.year = year
        
        if self.month == 6:
            self.days = range(152, 182)
        
        if self.position == 'gms':
            self.satellite = 'goes09'
            self.times = ['0025',
                          '0125',
                          '0225',
                          '0325',
                          '0413',
                          '0449',
                          '0525',
                          '0625',
                          '0725',
                          '0825',
                          '0925',
                          '1013',
                          '1049',
                          '1125',
                          '1150',
                          '1225',
                          '1325',
                          '1425',
                          '1525',
                          '1613',
                          '1649',
                          '1725',
                          '1825',
                          '1925',
                          '2025',
                          '2125',
                          '2213',
                          '2249',
                          '2325']
        elif self.position == 'goes-w':
            self.satellite = 'goes10'
            self.times = []
            # Scans are performed every three hours on the hour
            for i in range(0, 22, 3):
                self.times.append(str(i).zfill(2) + '00')
        elif self.position == 'goes-e':
            self.satellite = 'goes12'
            self.times = []
            # Scans are performed every three hours at quarter till starting at
            # 02:45
            for i in range(0, 22, 3):
                self.times.append(str(i + 2).zfill(2) + '45')
    
    def generate_views(self, naming_convention):
        '''
        Generates file names for views that occured in the specified time span
        for the satellite in question according to a specific naming convention.
        '''
        
        self.needed_views = []
        if naming_convention == 'noaa':
            for day in self.days:
                for time in self.times:
                    self.needed_views.append(self.satellite + '.' + 
                                             str(self.year) + '.' + 
                                             str(day) + '.' + 
                                             time)
    
    def find_views(self):
        '''
        Reads a specified file and generates view names that match the 
        generated view names.
        '''
        
        # Generate name of file to be read
        work_directory = ('/home/lee/Documents/eclipse-workspace/master_lee/'
                          'data/download_scripts/')
        file_name = (work_directory + 'already_downloaded_' + 
                     self.position + '.txt')
        self.downloaded_views = []
        # Read downloaded view from file
        with open(file_name, 'r') as name_file:
            line = name_file.readline()
            while line:
                # Truncate file names to not include seconds or band numbers.
                line = line[:-11]
                self.downloaded_views.append(line)
                line = name_file.readline()
    
    def take_inventory(self):
        '''
        Compares self.downloaded_views and self.needed views and prints needed
        vies that are not contained in self.downloaded_views
        '''
        
        count = 0
        for needed_view in self.needed_views:
            if not needed_view in self.downloaded_views:
                print needed_view
                count += 1
        print('You need to download ' + str(count) + ' views.')

def main():
    naming_convention = 'noaa'
    
    # Get satellite from user
    position = raw_input('Which satellite position would you like to generate\n'
                         'names for?\n')
    # Initialize object
    sat_generator = SatelliteViews(position)
    # Generate list of needed files
    sat_generator.generate_views(naming_convention)
    # Read file with list of downloaded imagery
    sat_generator.find_views()
    # Compare downloaded files with files needed
    sat_generator.take_inventory()
    # Print files needed that aren't in list of downloaded files

if __name__ == '__main__':
    main()