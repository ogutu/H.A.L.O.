
# Analyse a time series 
# Prepare the netcdf-file that contains the time series with cdo

# name of the file
filename = "YOURFILENAME.nc"

# Select from the List of Products/DataSets
# (Information required to generate the name of the directory)
product <- "SIS"

# type = Products or DataSets
# (Information required to generate the name of the directory)
type <- "Products"

# For HLW and HSH select the variable and the vertical level
# HLW: level: 1-5, variable: LPWm, RHWm, Tm
# HSH: level: 1-6, variable: Qm, Tm
variable <- "Tm"
level <- 4

# For Cloud Type (CTY) specify the type that should be plotted!
# 1 = Low Clouds, 2 = Middle level clouds, 3 = High opaque clouds
# 4 = High Semitransparent clouds, 5 = Fractional Clouds
CTY.type <- 4

# If you want to create a png-file, you need to specify the filename 
picout <- FALSE
picfile <- "YOURPICFILENAME.png"

# Set the size of the output window
width <- 650
height <- 800

# This directory needs to be adjusted only once
dir <- "YOURDATADIRECTORY"
#dir <- "C:/Dokumente und Einstellungen/jtrentma/Desktop/CMSAF_V2/Data/"

#----------------------------------------------------------------
# NO CHANGES REQUIRED BEYOND THIS POINT
#----------------------------------------------------------------


datadir <- paste(dir,type,product,"",sep="/")
file <- paste(datadir,filename,sep="")
picdir <- paste(datadir,"pics/",sep="/")

# Set the number of rows and columns
nrow <- 3
ncol <- 2

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

if (att.get.ncdf(nc,varname,"title")$hasatt==TRUE) {
	name <- att.get.ncdf(nc,varname,"title")$value 
	} else {
	 name <- product 
	}

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
if (product == "HLW" || product =="HSH") {
	levdim <- nc$dim[["lev"]]
	level.out <- levdim$vals[level]
	}

#--------------------------------------------------#

# retrieve the time variable
timedim <- nc$dim[["time"]]
nt <- timedim$len
time.unit <- timedim$units
time <- timedim$vals

# Create a R-date-object 
date.time <- as.Date(utcal.nc(time.unit,time,type="s"))

# Create vectors of the months and years, respectively
timemonth <- format(date.time,"%m")
timeyear <- format(date.time,"%Y")

#--------------------------------------------------#
title <- name
if (product == "HLW" || product =="HSH") {
	title <- paste(varname,", level: ",level.out,sep="")
	}
	
#title <- paste(lat," N, ",lon," E",sep="")
varlabel <- paste(title," (",unit,")",sep="")

# The function tapply is very useful for operations that 
# operate along the time axis, e.g., calculating mean monthly values
field.monmean <- tapply(field,timemonth,mean,na.rm=TRUE)
field.monmax <- tapply(field,timemonth,max,na.rm=TRUE)
field.monmin <- tapply(field,timemonth,min,na.rm=TRUE)
field.monsd <- tapply(field,timemonth,sd,na.rm=TRUE)


# Annual mean is only calculated if data for all 12 month are available
field.annmean <- tapply(field,timeyear,mean,na.rm=FALSE)
# Include only those years with 12 months on data
years <- dimnames(field.annmean)[[1]]
nyears <- length(years)
nmonth <- vector(mode="numeric",length=nyears)
for (i in 1:nyears) {
	nmonth[i] <- length(which(timeyear==years[i]))
	}
ind <- which(nmonth < 12)
field.annmean[ind] <- NA

# Calculate anomalies
field.ano <- vector(mode="numeric",length=nt)
field.relano <- vector(mode="numeric",length=nt)
for (j in 1:nt)
	{
	field.ano[j] <- field[j] - field.monmean[timemonth[j]]
	field.relano[j] <- field.ano[j]/field.monsd[timemonth[j]]
	}


# Open a png-file
if (picout == TRUE) png(file=paste(picdir,picfile,sep=""),width=width,height=height)

# set the number of rows and columns of the plot
par(mfrow = c(nrow,ncol))

# Determine the min and max of the plotrange
pmin <- min(field,na.rm=TRUE)
pmax <- max(field,na.rm=TRUE)

#plot the data
plot(date.time,field, ylab=varlabel, xlab="",
        main=paste(title,", ",format(lat,digits=4,nsmall=2)," N, ",
          format(lon,digits=4,nsmall=2)," E",sep=""),
        ylim=c(pmin,pmax),type="l")

#--------------------------------------------------
# Plot the monthly mean seasonal cycle
months <- seq(1:12)
# Determine the min and max of the plotrange
pmin <- min(field.monmin,na.rm=TRUE)
pmax <- max(field.monmax,na.rm=TRUE)

plot(months,field.monmax,type="n",main="Average Seasonal Cycle",
     ylab=varlabel,xlab="Months",ylim=c(pmin,pmax))
lines(months,field.monmax)
lines(months,field.monmin)
polygon(c(months,rev(months)),c(field.monmin,rev(field.monmax)),col="red")
lines(months,field.monmean,lwd=3)


#--------------------------------------------------
# Plot the monthly anomalies
pmin <- min(field.ano,na.rm=TRUE)
pmax <- max(field.ano,na.rm=TRUE) + 0.15 * (max(field.ano,na.rm=TRUE) - min(field.ano,na.rm=TRUE))
drange <- pmax - pmin
plot(date.time,field.ano, ylab=varlabel, xlab="",
        main="Monthly anomalies",
        ylim=c(pmin,pmax), type="l")
lines(date.time,rep(0,length(date.time)),lwd=2.0,col="green")

#--------------------------------------------------
# Boxplot of the time series
# Define the months as a categorical variable
month_cat <- factor(timemonth)
plot(month_cat,field,main="Box Plot",ylab=varlabel,xlab="Months")


#--------------------------------------------------
# Plot the annual means
plot(as.integer(years)+0.5,field.annmean,type="p",main="Annual Means",
ylab=varlabel,xlab="",pch=19)

#--------------------------------------------------
# Plot a histogram of the data
hist_field <- hist(field,breaks=20,xlab=varlabel,
                   main=paste("Histogram of ",title,sep=""))


# close the jpg-file
if (picout == TRUE) dev.off()
