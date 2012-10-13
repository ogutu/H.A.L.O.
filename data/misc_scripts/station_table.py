class Station():
    '''
    A BSRN station.
    '''
    
    def __init__(self,
                 abbreviation,
                 latitude,
                 longitude,
                 height):
        self.abbreviation = abbreviation
        self.latitude = latitude
        self.longitude = longitude
        self.height = height
        self.assign_name()
        
    def assign_name(self):
        '''
        Assigns the real station name based on the abbreviation provided.
        '''

class Record():
    '''
    A BSRN station record.
    '''
    
    def __init__(self,
                 text_file):
        self.text_file = text_file
        self.extract_station_parameters()
        
    def extract_station_parameters(self):
        '''
        Read station abbreviation, latitude, longitude and height from text
        file.
        '''

pass StationTable():
    '''
    A table of all stations read.
    '''

