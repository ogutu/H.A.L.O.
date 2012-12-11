#######################################################################################
# Trend analysis of time series
#
# CAUTION: THIS SCRIPTS SHOULD NOT BE APPLIED TO OPERATIONAL CM SAF PRODUCTS!!
#
#          MEANINGFUL TRENDS CAN ONLY BE CALCULATED FROM CM SAF DATASETS THAT HAVE
#
#          'CLIMATE QUALITY'
#
#######################################################################################

# name of the file
filename = "YOURTIMESERIESFILE.nc"

# Select from the List of Products/DataSets
# (Information required to generate the name of the directory)
product <- "SIS"

# type = Products or DataSets
# (Information required to generate the name of the directory)
type <- "DataSets"

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
picfile <- "YOUPICFILENAME.png"

# Set the size of the output window
width <- 700
height <- 700

# This directory needs to be adjusted only once
dir <- "YOURDATADIRECTORY"
#dir <- "C:/Dokumente und Einstellungen/jtrentma/Desktop/CMSAF_V2/Data/"

#----------------------------------------------------------------
# NO CHANGES REQUIRED BEYOND THIS POINT
#----------------------------------------------------------------

datadir <- paste(dir,type,product,"",sep="/")
file <- paste(datadir,filename,sep="")
picdir <- paste(datadir,"pics/",sep="/")

nrow <- 2
ncol <- 2

# make sure you have the ncdf- and the Kendall-packages installed on your
# local R-installation
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
nt.in <- timedim$len
time.unit <- timedim$units
time <- timedim$vals

# Create a R-date-object 
date.time.in <- as.Date(utcal.nc(time.unit,time,type="s"))

# Create vectors of the months and years, respectively
timemonth.in <- format(date.time.in,"%m")
timeyear.in <- format(date.time.in,"%Y")

startyear <- timeyear.in[1]
startmonth <- timemonth.in[1]
endyear <- timeyear.in[nt.in]
endmonth <- timemonth.in[nt.in]

# Create a continous time axis from the starttime to the endtime
ntmax <- 500
date.time.tmp <- vector(ntmax,mode="character")

k <- 0
for (j in as.integer(startmonth):12)  {
    k <- k + 1
	date.time.tmp[k] <- paste(startyear,as.character(j),"01",sep="-")
}		
for (i in (as.integer(startyear)+1) : (as.integer(endyear)-1)) {
		for (j in 1:12) {
		k <- k + 1
		date.time.tmp[k] <- paste(as.character(i),as.character(j),"01",sep="-")
		}		
}
for (j in 1:as.integer(endmonth)) {
	k <- k + 1	
	date.time.tmp[k] <- paste(endyear,as.character(j),"01",sep="-")
}
		  
date.time <- as.Date(date.time.tmp[1:k])
nt <- k
# Create vectors of the months and years, respectively
timemonth <- format(date.time,"%m")
timeyear <- format(date.time,"%Y")

# Create the new data with NA data values 
field.tmp <- vector(nt,mode="numeric")
field.tmp <- NA

for (i in 1:nt.in) {
	time.diff <- as.vector(mode="numeric",difftime(date.time,date.time.in[i]))
	ind <- which(time.diff==0)
	field.tmp[ind] <- field[i]
}
field <- field.tmp

#--------------------------------------------------#

title <- name
if (product == "HLW" || product =="HSH") {
	title <- paste(varname,", level: ",level.out,sep="")
	}
varlabel <- paste(title," (",unit,")",sep="")

#--------------------------------------------------#

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

# Open a jpg-file
if (picout == TRUE) png(file=paste(picdir,picfile,sep=""),width=width,height=height)

# set the number of rows and columns of the plot
par(mfrow = c(nrow,ncol),cex=0.8)
# Set the size of the text in the figures
tcex <- 1.0

# --------------------------------------------------
#plot the original data
# Determine the min and max of the plotrange
pmin <- min(field,na.rm=TRUE)
pmax <- max(field,na.rm=TRUE) + 0.15 * (max(field,na.rm=TRUE) - min(field,na.rm=TRUE))
drange <- pmax - pmin

plot(date.time,field, ylab=varlabel, xlab="",
       main=paste(title,", ",format(lat,digits=4,nsmall=2)," N, ",
          format(lon,digits=4,nsmall=2)," E",sep=""),
        ylim=c(pmin,pmax),type="l")

# calculate the linear trend of the original data
x <- c(1:nt)
model <- lm(field~x,na.action=na.exclude)
lines(date.time,predict(model),col="red",lwd=3)
print(summary(model))
conf <- confint(model,"x",level=0.95)

# extract the linear trend and the upper and lower confidence interval
# calculate the annual trend
trend <- model$coeff["x"]*12.
lconf <- conf[1]*12.
uconf <- conf[2]*12

mean.out <- format(mean(field,na.rm=TRUE),digits=3,nsmall=1)
trend.out <- paste("[",format(lconf,digits=2,nsmall=2),",",format(trend,digits=2,nsmall=2),",",
	format(uconf,digits=2,nsmall=2),"] ",sep="")

# Determine the x-location of the text in date format
xtext <- as.Date(paste(startyear,startmonth,01,sep="-"))

text(xtext,pmax-0.01*drange,paste("mean:",mean.out,unit,sep=" "),pos=4,cex=tcex)
text(xtext,pmax-0.08*drange,paste("linear trend:",trend.out,unit,"/yr",sep=""),pos=4,cex=tcex)



# -------------------------------------------------- 
# Calculate the trend based on the monthly anomalies
# -------------------------------------------------- 

pmin <- min(field.ano,na.rm=TRUE)
pmax <- max(field.ano,na.rm=TRUE) + 0.15 * (max(field.ano,na.rm=TRUE) - min(field.ano,na.rm=TRUE))
drange <- pmax - pmin

# Determine the min and max of the plotrange
#pmin <- min(field.ano,na.rm=TRUE)
#pmax <- max(field.ano,na.rm=TRUE)*1.05
#drange <- pmax - pmin

plot(date.time,field.ano, ylab=varlabel, xlab="",
        main="Monthly anomalies",
        ylim=c(pmin,pmax), type="l")

# calculate the linear trend of the anomaly data
x <- c(1:nt)
model <- lm(field.ano~x,na.action=na.exclude)
lines(date.time,predict(model),col="red",lwd=3)
print(summary(model))
conf <- confint(model,"x",level=0.95)

# extract the linear trend and the upper and lower confidence interval
# calculate the annual trend
trend <- model$coeff["x"]*12.
lconf <- conf[1]*12.
uconf <- conf[2]*12

trend.out <- paste("[",format(lconf,digits=2,nsmall=2),",",format(trend,digits=2,nsmall=2),",",
	format(uconf,digits=2,nsmall=2),"] ",sep="")

# Determine the x-location of the text in date format
xtext <- as.Date(paste(startyear,startmonth,01,sep="-"))

text(xtext,pmax-0.01*drange,paste("linear trend:",trend.out,unit,"/yr",sep=""),pos=4,cex=tcex)

# -------------------------------------------------- 
# Calculate the trend based on the annual means

pmin <- min(field.annmean,na.rm=TRUE)
pmax <- max(field.annmean,na.rm=TRUE) + 0.15 * (max(field.annmean,na.rm=TRUE) - min(field.annmean,na.rm=TRUE))
drange <- pmax - pmin

#pmin <- min(field.annmean,na.rm=TRUE)
#pmax <- max(field.annmean,na.rm=TRUE)*1.05
#drange <- pmax - pmin

x <- seq(min(timeyear),max(timeyear))
dx <- 0.5*(x[2] - x[1])
plot(x+dx,field.annmean,ylab=varlabel,xlab="",main="Annal Mean Values",ylim=c(pmin,pmax))
print(summary(field.annmean))

# Set up of the model to calculate the trend of the annual means
model <- lm(field.annmean~x,na.action=na.exclude)
lines(x+dx,predict(model),col="red",lwd=3)
print(summary(model))
trend <- model$coeff["x"]
conf <- confint(model,"x",level=0.95)

# extract the linear trend and the upper and lower confidence interval
trend <- model$coeff["x"]
lconf <- conf[1]
uconf <- conf[2]

mean.out <- format(mean(field.annmean,na.rm=TRUE),digits=3,nsmall=1)
trend.out <- paste("[",format(lconf,digits=2,nsmall=2),",",format(trend,digits=2,nsmall=2),",",
	format(uconf,digits=2,nsmall=2),"] ",sep="")
	
xtext <- min(x)
text(xtext,pmax-0.01*drange,paste("mean:",mean.out,unit,sep=""),pos=4,cex=tcex)
text(xtext,pmax-0.08*drange,paste("linear trend:",trend.out,unit,"/yr",sep=""),pos=4,cex=tcex)
	
# close the jpg-file
if (picout == TRUE) dev.off()
