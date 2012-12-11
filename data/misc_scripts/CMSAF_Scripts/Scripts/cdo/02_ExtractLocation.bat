@echo off
REM This batch file extracts data for ONE LOCATION
echo This batch file extracts data for ONE LOCATION
PAUSE

REM Select the product here
echo Select the product (e.g., SIS)
set /p product=

set type=DEFAULT
REM Is this in Products or DataSets?
echo Is this a Product or a DataSet? (Type "P" for Product or "D" for Dataset)
echo (Information required to generate the directory name)
set /p typein=
set typein=%typein: =%
if /I %typein% EQU P (set type=Products)
if /I %typein% EQU D (set type=Datasets)
if /I %type% EQU DEFAULT (
echo Error: please type "P" or "D" 
pause
exit
)

REM Select input file
echo Select the input file (without file extension)
set /p Datafile=

REM Select Longitude and Latitude
echo Select the longitude
set /p lon=
echo Select the latitude
set /p lat=

REM Select output filename:
echo Select the output file name (no file extension)
set /p Outfile=

REM -----------------------------------------------------------------

REM Remove the blanks
set product=%product: =%
set Datafile=%Datafile: =%
set lon=%lon: =%
set lat=%lat: =%
set Outfile=%Outfile: =%

set datadir=..\..\Data\%type%\%product%\

cd %datadir%

cdo -remapbil,lon=%lon%_lat=%lat% %Datafile%.nc %Outfile%.nc

echo Processing finished!

PAUSE