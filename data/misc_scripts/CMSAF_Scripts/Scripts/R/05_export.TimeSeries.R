# Export the data from a timeseries netcdf file 

# name of the file
filename <- "YOURFILENAME.nc"

# Select from the List of Products/DataSets
# (Information required to generate the name of the directory)
product <- "SIS"

# type = Products or DataSets
# (Information required to generate the name of the directory)
type <- "Products"

# Set the name of the output file
outfilename <- "YOURFILENAME.csv"

# For HLW and HSH select the variable and the vertical level
# HLW: level: 1-5, variable: LPWm, RHWm, Tm
# HSH: level: 1-6, variable: Qm, Tm
variable <- "Tm"
level <- 4

# For Cloud Type (CTY) specify the type that should be plotted!
# 1 = Low Clouds, 2 = Middle level clouds, 3 = High opaque clouds
# 4 = High Semitransparent clouds, 5 = Fractional Clouds
CTY.type <- 4

# This directory needs to be adjusted only once
dir <- "YOURDATADIRECTORY"
#dir <- "C:/Dokumente und Einstellungen/jtrentma/Desktop/CMSAF_V2/Data"

#----------------------------------------------------------------
# NO CHANGES REQUIRED BEYOND THIS POINT
#----------------------------------------------------------------

datadir <- paste(dir,type,product,"",sep="/")

file <- paste(datadir,filename,sep="")
outfile <- paste(datadir,outfilename,sep="")

# make sure you have the ncdf- and RNetCDF-packages installed on your R-installation!!
library(ncdf)
library(RNetCDF)

# Define the HOAPS2011 data set
HOAPS2011 <- c("PRE","EMP","EVA","LHF","NSH","SWS")

# Open the netcdf-file
nc <- open.ncdf(file)

# Retrieve the name of the variable and the data
datalev <- 1
if (product %in% HOAPS2011) datalev <- 2
if (product == "CTY") datalev <- CTY.type

varname <- nc$var[[datalev]]$name
# In HLW and HSH multiple variables are stored in each file
if (product == "HLW" || product =="HSH") {
	varname <- paste(product,"_",variable,sep="")
	}
	
# Read in the data
field <- get.var.ncdf(nc, varname)
if (product == "HLW" || product =="HSH") {
	field <- field[level,]
	}	
	
unit <- att.get.ncdf(nc, varname,"units")$value

missval <- att.get.ncdf(nc,varname,"_FillValue")$value
# The offset and the scalefactor is required because
# the Fill_Value attribue is not applied by the ncdf-package
# The offset and scalefactor is automatically applied to all data
offset.value <- 0.
scale.factor <- 1.
if (att.get.ncdf(nc,varname,"add_offset")$hasatt==TRUE) {
	offset.value <- att.get.ncdf(nc,varname,"add_offset")$value }
if (att.get.ncdf(nc,varname,"scale_factor")$hasatt==TRUE) {
	scale.factor <- att.get.ncdf(nc,varname,"scale_factor")$value }

# Close the file
close.ncdf(nc)

# Set the missing data to NA
# Since the data has been corrected for the scalefactor and the offset, 
# this has also to be considered for the FillValue
na.ind <- which(field== (missval*scale.factor + offset.value))
field[na.ind] <- NA

#--------------------------------------------------#

# determine the location 
londim <- nc$dim[["lon"]]
lon <- londim$vals
latdim <- nc$dim[["lat"]]
lat <- latdim$vals

#--------------------------------------------------#

# retrieve the time variable
timedim <- nc$dim[["time"]]
nt <- timedim$len
time.unit <- timedim$units
time <- timedim$vals

# Create a R-date-object 
date.time <- as.Date(utcal.nc(time.unit,time,type="s"))

#--------------------------------------------------#

out <- data.frame(date.time,field)

write.csv2(out, file = outfile)