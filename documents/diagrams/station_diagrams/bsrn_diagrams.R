setwd("/home/lee/Dropbox/master/Diagramme/")
bsrn <- read.csv("bsrn.csv", header=T)
# Keep only wanted columns
bsrn <- bsrn[2:6]

ExportStationGraph <- function(station) {
  # Exports a station graph as a PNG
  #
  # Args: 
  #   dataframe: The data frame to be used (30 rows)
  
  # Plot SIS & SID
  station.coordinates <- 
    paste(station$lat[1], "°N, ", station$lon[1], "°E", sep="")
  png(paste(station$lat[1], station$lon[1], ".png"))
  # Expand plot to make room for legend
  par(mar=par()$mar + c(0, 0, 0, +4), xpd=T)
  # Find upper limit
  highest.value <- max(c(max(station$sis), max(station$sid)))
  lowest.value <- min(c(min(station$sis), min(station$sid)))
  # Make plot
  plot(station$sis, 
       ylim=c(lowest.value, highest.value), 
       type='o', 
       pch=15, 
       xlab="Day of month", 
       ylab="Wh * m**2 * day**-1", 
       main=station.coordinates)
  legend("right", 
         inset=c(-0.2, 0), 
         legend=c("SID", "SIS"), 
         pch=c(22, 15), 
         lty=c(1))
  lines(station$sid, type='o', pch=22)
  dev.off()
}

stations <- length(bsrn[,1]) / 30
for (station in 1:stations) {
  first.row <- station * 30 - 29
  last.row <- station * 30
  station <- bsrn[first.row:last.row,]
  ExportStationGraph(station)
}
