library(raster)
setwd("/home/lee/Documents/eclipse-workspace/master_lee/data/pictures/stills/scans/goes-w/normalized/")
png("output.png",
    width=1920,
    height=1080)

# Collect rasters for GOES-W
j <- 0
scans <- c()
names <- c()
for (i in c("00", "03", "06", "09", "12", "15", "18", "21")) {
    j = j + 1
    scans[j] <- paste("goes10.2003.152.", i, "00.out.pgm.png", sep="")
    names[j] <- paste("UTC", i, "00", sep="")
}

# Set titles
names(scans) <- names
# Plot all scans
goes_w_day <- stack(scans)
plot(goes_w_day, 
     
     plot(s,
     # Black and white color ramp
     col=colorRampPalette(c("black", "white"))(255),
     # 4 columns
     nc=4,
     # No legend
     legend=F,
     # No axes
     axes=F,
     # High resolution
     maxpixels=ncell(goes_w_day)/8,
          cex.axis=500
     )

dev.off()