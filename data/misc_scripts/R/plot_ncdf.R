setwd("/home/lee/Downloads/local")

# Read raster
goes9 <- raster("goes09.nc")
# Plot it. Apparently, only global was read.
plot(goes9)

# Make netCDF data object
goes9 = open.ncdf("goes09.nc")
plot(goes9)

# I can also extract the variables individually as a raster brick. Here I pull
# out beam irradiation.
goes9 <- brick("goes09.2003.152.0325G.out.nc", varname="B")
goes10 <- brick("goes10.2003.153.0000G.out.nc", varname="B")
goes12 <- brick("goes12.2003.152.1745G.out.nc", varname="B")
plot(goes9, xlim=c(-180, 180))
plot(goes10, add=T)

# Extract value at coordinates
# Extract from beam at 140°E, 0°N
# Can also be done with points (syntax w/ xy as points: "extract(beam, xy)")
extract(beam, 140, 30)

library(raster)
raster1 <- raster("clara.2003.152.0000G.tif")
raster2 <- raster("clara.2003.153.0000G.tif")
plot(merged)
# cbind takes the x, y coordinates and puts them in the format expected by extract()
extract(merged, cbind(-30, 0))
summary(merged)
plot(raster1 - raster2)