@echo off
REM This script performs some statistical calculations

echo This script performs statistical calculations based on cdo

PAUSE

REM Select the product heres
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

REM Select the input file
echo Select the name of the input file (no file extension)
set /p Datafile=

REM Select the Operator for statistical computing (ie ymonmean, ymonmax etc.)
REM timmean: temporal averaging
REM ymonmean: Multiyear-monthly average
echo Select the operator (ie ymonmean, yearmean, fldmean etc.)
set /p Operator=

REM Select output filename
echo Select the name of the output file (no file extension)
set /p Outfile=

REM Remove blanks
set product=%product: =%
set Datafile=%Datafile: =%
set type=%type: =%

REM Set the working directories
set datadir=..\..\Data\%type%\%product%\

cd %datadir%

cdo %Operator% %Datafile%.nc %Outfile%.nc 

echo Processing finished!

PAUSE