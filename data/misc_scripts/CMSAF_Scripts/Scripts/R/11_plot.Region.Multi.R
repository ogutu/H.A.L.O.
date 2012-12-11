# This script displays a map of the selected product 
# You can either specify a certain year / month from a data file with several time steps
# or plot one 2D field 

# name of the file
filename <- "YOURDATAFILENAME.nc"

# type = Products or DataSets
# (Information required to generate the name of the directory)
type <- "Products"

# Select from the List of Products/DataSets
# (Information required to generate the name of the directory)
product <- "SIS"

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
picfile.ext <- "YOURPICFILENAME"

# In case you want to add something to the title of the plot
add2title <- "CM SAF, "

# select the plot region
lonmin <- 0
lonmax <- 10
latmin <- 5
latmax <- 15

# Set the size of the output window (in # of pixels)
height <- 600
width <- 600

# Select to plot an anomaly (use of appropriate color scale)
plot.ano <- FALSE

# Set the breaks of the color bar manually
# Suggested for plotting of anomalies
set.col.breaks <- FALSE
#brk.set <- c(-50,-20,-10,-5,-2.5,2.5,5,10,20,50)
brk.set <- seq(240,310,5)

# select the range of the color bar
# select -99 for flexible range
colmin0 <- -99
colmax0 <- -99
# Set the number of colors
ncol <- 11

# Set to true if higher resolution additional data is required
plotHighRes <- FALSE
plotVeryHighRes <- FALSE

# Switches to determine additional plot layers
plotCoastline <- TRUE
plotCountries <- TRUE
plotRivers <- FALSE
plotLakes <- FALSE
# Thickness of the additional lines
contour.thick <- 2.

# Switches to control the display of cities
plotCities <- FALSE
# Set to true if more cities should be displayed
plotCitiesHighRes <- FALSE
plotCitiesVeryHighRes <- FALSE
# symbol
pch.cities <- 2
# size of symbol
cex.cities <- 1.
# name next to the sysmbol?
label.cities <- TRUE
# size of the label
cex.label.cities <- 0.5
# lat offset of label
dlat <- 0.25

# Set the main directoy 
dir <- "YOURDATADIRECTORY"
#dir <- "C:/Dokumente und Einstellungen/jtrentma/Desktop/CMSAF_V2/Data/"

#----------------------------------------------------------------
# NO CHANGES REQUIRED BEYOND THIS POINT
#----------------------------------------------------------------

datadir <- paste(dir,type,product,"",sep="/")
picdir <- paste(datadir,"pics/",sep="/")
file <- paste(datadir,filename,sep="")

# make sure that you have the ncdf-, the fields- and the maps-package installed! 
library(ncdf)
library(RNetCDF)
library(fields)
library(maptools)
library(RColorBrewer)
library(colorRamps)

if (plotCoastline) {
aux.file <- "110m_coastline.shp"
if (plotHighRes) aux.file <- "50m_coastline.shp"
if (plotVeryHighRes) aux.file <- "10m_coastline.shp"
coastline.file <- paste(dir,"AuxiliaryData/coastline/",aux.file,sep="")
coastline <- readShapeSpatial(coastline.file)
coastline <- as(coastline,"SpatialLines")
}

if (plotCountries) {
aux.file <- "ne_110m_admin_0_countries.shp"
if (plotHighRes) aux.file <- "ne_50m_admin_0_countries.shp"
if (plotVeryHighRes) aux.file <- "ne_10m_admin_0_countries.shp"
countries.file <- paste(dir,"AuxiliaryData/countries/",aux.file,sep="")
countries <- readShapeSpatial(countries.file)
countries <- as(countries,"SpatialLines")
}

if (plotRivers) {
aux.file <- "110m-rivers-lake-centerlines.shp"
if (plotHighRes) aux.file <- "50m-rivers-lake-centerlines.shp"
if (plotVeryHighRes) aux.file <- "ne_10m_rivers_lake_centerlines.shp"
rivers.file <- paste(dir,"AuxiliaryData/rivers/",aux.file,sep="")
rivers <- readShapeSpatial(rivers.file)
rivers <- as(rivers,"SpatialLines")
}

if (plotLakes) {
aux.file <- "110m_lakes.shp"
if (plotHighRes) aux.file <- "50m-lakes.shp"
if (plotVeryHighRes) aux.file <- "ne_10m_lakes.shp"
lakes.file <- paste(dir,"AuxiliaryData/lakes/",aux.file,sep="")
lakes <- readShapeSpatial(lakes.file)
lakes <- as(lakes,"SpatialLines")
}

if (plotCities) {
aux.file <- "ne_110m_populated_places.shp"
if (plotCitiesHighRes) aux.file <- "ne_50m_populated_places.shp"
if (plotCitiesVeryHighRes) aux.file <- "ne_10m_populated_places.shp"
cities.file <- paste(dir,"AuxiliaryData/populated-places/",aux.file,sep="")
cities <- readShapeSpatial(cities.file)
lon.cities <- cities@data$LONGITUDE
lat.cities <- cities@data$LATITUDE
names.cities <- cities@data$NAME

}

# Set the plot ranges
lonplot=c(lonmin,lonmax)
latplot=c(latmin,latmax)

# Define the HOAPS2011 data set
HOAPS2011 <- c("PRE","EMP","EVA","LHF","NSH","SWS")

# Open the netcdf-file
nc <- open.ncdf(file)

# Retrieve the name of the variable and the data
datalev <- 1
if (product %in% HOAPS2011) datalev <- 2
if (product == "CTY") datalev <- CTY.type

# Set the variable name
varname <- nc$var[[datalev]]$name

# In HLW and HSH multiple variables are stored in each file
if (product == "HLW" || product =="HSH") {
	varname <- paste(product,"_",variable,sep="")
	}

# Retrieve the unit, the missing_data-value, and the title of the data
unit <- att.get.ncdf(nc, varname,"units")$value
missval <- att.get.ncdf(nc,varname,"_FillValue")$value

if (att.get.ncdf(nc,varname,"title")$hasatt==TRUE) {
	name <- att.get.ncdf(nc,varname,"title")$value 
	} else {
	 name <- varname
	}
	
# The offset and the scalefactor is required because
# the Fill_Value attribute is not applied by the ncdf-package
# The offset and scalefactor is automatically applied to all data
offset.value <- 0.
scale.factor <- 1.
if (att.get.ncdf(nc,varname,"add_offset")$hasatt==TRUE) {
	offset.value <- att.get.ncdf(nc,varname,"add_offset")$value }
if (att.get.ncdf(nc,varname,"scale_factor")$hasatt==TRUE) {
	scale.factor <- att.get.ncdf(nc,varname,"scale_factor")$value }

#--------------------------------------------------#

# determine the grid
londim <- nc$dim[["lon"]]
lon <- londim$vals
nx <- londim$len
latdim <- nc$dim[["lat"]]
lat <- latdim$vals
ny <- latdim$len
	
#--------------------------------------------------#

# retrieve the time variable
timedim <- nc$dim[["time"]]
nt <- timedim$len
time.unit <- timedim$units
time <- timedim$vals

# Create a R-date-object 
date.time <- as.Date(utcal.nc(time.unit,time,type="s"))

for (itime in 1:nt) {
  
# Read in the data 
  field <- get.var.ncdf(nc, varname,start=c(1,1,itime),count=c(nx,ny,1))	
  
# Set the missing data to NA
# Since the data has been corrected for the scalefactor and the offset, 
# this has also to be considered for the FillValue
  na.ind <- which(field==(missval*scale.factor + offset.value))
  field[na.ind] <- NA

# format the time step for plotting
if (nt > 1) {
  zdate <- paste(format(date.time[itime],"%Y%m"),sep=" ")
  if (nt == 12) zdate <- paste(format(date.time[itime],"%m"),sep=" ")
	} else zdate <- ""
	 
# Set the variable to make the plot
  z <- field

# Invert the latitude dimension if necessary
  if (lat[ny] < lat[1]) {
    sort.out <- sort(lat,index.return=TRUE)
    lat <- sort.out$x
	inv.lat <- TRUE    
  }
  if (inv.lat) z <- z[,sort.out$ix]
  
# calulate the mean, min, max for the selected region only
  lon.reg <- which(lon >= lonmin & lon <= lonmax)
  lat.reg <- which(lat >= latmin & lat <= latmax)
  z.reg <- z[lon.reg,lat.reg]

# print out the mean value of the field
  print(paste("Mean: ",mean(z.reg,na.rm=TRUE),sep=''))
  print(paste("Max: ",max(z.reg,na.rm=TRUE),sep=''))
  print(paste("Min: ",min(z.reg,na.rm=TRUE),sep=''))

# Set the title of the plot
  title <- name

#----------------------------------------------------------
# Open a png-file
 
 picfile <- paste(picfile.ext,zdate,".png",sep="")
  if (picout == TRUE) png(file=paste(picdir,picfile,sep=""),height=height,width=width)

  colmin <- colmin0
  colmax <- colmax0

  if ((as.integer(colmin) == -99) && (as.integer(colmax) == -99)) {
		colmin <- min(z.reg,na.rm=TRUE)
		colmax <- max(z.reg,na.rm=TRUE)
		}
  
  if (set.col.breaks) {
		brk <- brk.set
		} else {
		brk <- seq(colmin,colmax,length.out=ncol+1)
		} 
  
# Set the colors and the color bar for the Difference plots
col.breaks <- brk
ncolor <- length(col.breaks)
at.ticks <- seq(1,ncolor)
names.ticks <- col.breaks[at.ticks]
zlim <- c(1,ncolor)
	
colors <- matlab.like(ncolor-1)
if (plot.ano) colors[as.integer(ncolor/2)] <- rgb(1,1,1)

# Generate the field to be plotted
field.plot <- matrix(ncol=ny,nrow=nx)
for (l in seq(1,ncolor-1) ) {
  idx <- which(z >= col.breaks[l] &
               z < col.breaks[l+1],arr.ind=TRUE)
  field.plot[idx] <- l + 0.1
}

# make the plot including color bar
image.plot(lon,lat,field.plot,xlab="longitude, deg E",ylab="latitude, deg N",
           main=paste(title," (",unit,"), ",add2title,zdate,sep=""),
           legend.mar = 4,xlim=lonplot,ylim=latplot,zlim=zlim,
           nlevel=ncolor-1,col=colors,
           axis.args=list(at=at.ticks,labels=names.ticks))
  

# add rivers
if (plotRivers) {
plot(rivers, add=TRUE, col="blue", lwd=contour.thick)
}

# add lakes
if (plotLakes) {
plot(lakes, add=TRUE, col="blue", lwd=contour.thick)
}

# add coastline
if (plotCoastline) {
plot(coastline, add=TRUE, lwd=contour.thick)
}

# add country borders
if (plotCountries) {
plot(countries, add=TRUE, lwd=contour.thick)
}

# add cities
if (plotCities) {
points(lon.cities,lat.cities,pch=pch.cities,cex=cex.cities)
if (label.cities) text(lon.cities,lat.cities+dlat,names.cities,cex=cex.label.cities)
}

# Draw lines around the plot
axis(1,lwd=1,at=c(lonmin,lonmax),tick=TRUE,lwd.ticks=0,labels=FALSE)
axis(2,lwd=1,at=c(latmin,latmax), tick=TRUE,lwd.ticks=0,labels=FALSE)
axis(3,lwd=1,at=c(lonmin,lonmax),tick=TRUE,lwd.ticks=0,labels=FALSE)
axis(4,lwd=1,at=c(latmin,latmax), tick=TRUE,lwd.ticks=0,labels=FALSE)

# close the jpg-file
if (picout == TRUE) dev.off()

}
		
# Close the file
  close.ncdf(nc)
