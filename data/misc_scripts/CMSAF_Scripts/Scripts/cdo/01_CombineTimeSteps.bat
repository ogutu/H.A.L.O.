
@echo off

echo This script combines several time steps of CM SAF data into one file
PAUSE

REM Select the product here (eg "SIS")
echo Select the product (e.g., SIS, CFC)
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

REM Set the output file name
set outfile=OUTFILE
echo Set the output file name (without extension)
set /p outfile=

REM ----------------------------------------------------------------------

set Dataset=%product%*
REM Remove all blanks
set product=%product: =%
set Dataset=%Dataset: =%
set type=%type: =%

set datadir=..\..\Data\%type%\%product%\nc\

cd %datadir%

REM Select the input file name
set infile=%Dataset%

cdo mergetime %infile%.nc ..\%outfile%.nc

PAUSE
