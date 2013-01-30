RemoveNAs <- function (table) {
  # Reads a CSV of raster values and removes unobserved stations
  #
  # Args:
  #   table (string): Path to the table to read
  #
  # Returns:
  #   Dataframe of only observed station measurements. Timestamps are row.names.
  
  # Read tables
  table <- read.csv(table)
  # Drop FID
  table$FID <- NULL
  # Turn it on its side
  table <- t(table)
  # Loop over columns and extract if they contain values
  keepers <- c()
  for (i in c(1:ncol(table))) {
    if (!invalid(sum(table[,i]))) {
      keepers[length(keepers) + 1] <- i
    }
  }
  return(subset(table, select=keepers))
}
GetDay <- function(timestamp) {
  # Extracts the observed day from a timestamp
  #
  # Args:
  #   timestamp (string): The row.name to extract the day from
  #
  # Returns:
  #   The observed day as string
  
  # Split timestamp by '.', return third element of result
  return(strsplit(timestamp, split="\\.")[[1]][3])
}
MakeDailySums <- function(table, column) {
  # Returns a vector of the daily sums of a given column in a table
  #
  # Args:
  #   table (dataframe): The dataframe to be used
  #   column (integer):  The column to sum in the dataframe
  #
  # Returns:
  #   A vector containing the daily sums of the variable in the station table
  
  # Position in table starts at 3 because of lat/lon rows
  i <- 3
  daily.sums <- c()
  # For each day in range:
  first.day <- as.numeric(GetDay(row.names(table)[3]))
  last.day <- as.numeric(GetDay(row.names(table)[nrow(table)]))
  for (day in first.day:last.day) {
    # Position in day
    j <- 0
    next.day <- day
    day.values <- c()
    while(!invalid(next.day) && day == next.day) {
      i <- i + 1
      j <- j + 1
      next.day <- GetDay(row.names(table)[i + 1])
      day.values[j] <- table[,column][i]
    }
    
    # Multiply each measurement by its proportion in the day to get Wh sums
    daily.sums[1 + day - first.day] <- 
      sum(day.values, na.rm=T) * (24 / length(day.values))
  }
  return(daily.sums)
}
MakeStationDataframe <- function(table, column) {
  # Makes a dataframe of the daily totals for a certain station
  #
  # Args:
  #   table   (dataframe): The table to use
  #   column  (integer):   The column (station) to extract the dataframe for
  #
  # Returns:
  #   A dataframe containing day, station coordinates and daily sums
  
  daily.sums <- MakeDailySums(table, column)
  day <- c(1:30)
  lat <- rep(table[,column][1], length(day))
  lon <- rep(table[,column][2], length(day))
  return(data.frame(day, lat, lon, daily.sums))
}
ExportStationTable <- function(table, path) {
  # Exports a station table to a CSV named after its coordinates
  # 
  # Args:
  #   table (dataframe): The dataframe to export as a CSV
  #   path  (string):    The folder to export to (requires trailing '/')
  
  lat <- table[1,2]
  lon <- table[1,3]
  export.file <- paste(lat, lon, sep='_')
  export.file <- paste(path, export.file, sep='')
  write.csv(table, file=paste(export.file, "csv", sep='.'), row.names=F)
}
MonthlySums <- function(dataframe) {
  # Makes monthly sum from a data frame of 1 month of daily sums
  #
  # Args:
  #   dataframe: The data frame to produce the sums from
  #
  # Returns:
  #   A data frame with the same fields as the input data frame
  monthly.sums <- t(data.frame(dataframe[1,1], 
                               dataframe[1,2], 
                               sum(dataframe[,4])))
  row.names(monthly.sum) <- c("lat", "lon", "monthly.sum")
  return(t(monthly.sum))
}
ExportDailySums <- function() {
  # Exports the daily sums for a given variable into CSVs
  
  setwd("/mnt/ssh/nauss_server/homogenized/validation/values_at_stations/")
  library(gtools)
  
  # GOES 10 cannot be validated (lacking stations), so it's left out
  # The others were already evaluated earlier so they're left out here too
  input.tables <- c("msat-p_sid.csv", "msat-p_sis.csv",
                    "msat-i_sid.csv", "msat-i_sis.csv")
  export.folders <- 
    c("/mnt/ssh/nauss_server/homogenized/validation/values_at_stations/msat-psid/",
      "/mnt/ssh/nauss_server/homogenized/validation/values_at_stations/msat-psis/",
      "/mnt/ssh/nauss_server/homogenized/validation/values_at_stations/msat-isid/",
      "/mnt/ssh/nauss_server/homogenized/validation/values_at_stations/msat-isis/")
  
  for (i in 1:length(input.tables)) {
    table <- RemoveNAs(input.tables[i])
    for (j in 1:ncol(table)) {
      station <- MakeStationDataframe(table, j)
      ExportStationTable(station, export.folders[i])
    }
  }
}
PrepareDailyTable <- function() {
  daily.sums <- t(data.frame(c(1:30)))
  row.names(daily.sums) <- "day"
  daily.sums <- t(daily.sums)
  return(daily.sums)
}  

# Make SID and SIS tables
{
  # Makes a large table containing summed observations from multiple sources
  
  daily.sums <- PrepareDailyTable()
  
  # Load all tables
  input.folders <- 
    c("~/Desktop/values_at_stations/bsrn/",
      "~/Desktop/values_at_stations/clarasis/",
      "~/Desktop/values_at_stations/erasis/",
      "~/Desktop/values_at_stations/goes09sid/",
      "~/Desktop/values_at_stations/goes09sis/",
      "~/Desktop/values_at_stations/goes12sid/",
      "~/Desktop/values_at_stations/goes12sis/",
      "~/Desktop/values_at_stations/msat-isid/",
      "~/Desktop/values_at_stations/msat-isis/",
      "~/Desktop/values_at_stations/msat-psid/",
      "~/Desktop/values_at_stations/msat-psis/")
  # Get the field names
  # Insert their values into the big table
}


  
# Validate
