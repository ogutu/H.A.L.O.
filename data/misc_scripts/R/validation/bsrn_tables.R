library(gtools)
#setwd("~/Network/ssh/nauss_server/homogenized/validation/values_at_stations/BSRN")
setwd("~/Documents/eclipse-workspace/master_lee/data/BSRN/data_062003/table_data")

LoadBSRNTable <- function (table.name) {
  # Loads a BSRN station table and reduces it to relevant variables
  #
  # Args:
  #   table.name: The path to the BSRN table to be read
  #
  # Returns:
  #   The cropped table as data frame
  
  # Crop tables down to the interesting variables
  table <- read.table(table.name, header=T, sep="\t")
  table <- data.frame(table$Date.Time,
                      table$Latitude,
                      table$Longitude,
                      table$Short.wave.downward..GLOBAL..radiation..W.m..2.,
                      table$Direct.radiation..W.m..2.)
  # Rename fields
  table$timestamp <- table$table.Date.Time
  table$lat <- table$table.Latitude
  table$lon <- table$table.Longitude
  table$sis <- table$table.Short.wave.downward..GLOBAL..radiation..W.m..2.
  table$sid <- table$table.Direct.radiation..W.m..2.
  
  table$table.Date.Time <- NULL
  table$table.Latitude <- NULL
  table$table.Longitude <- NULL
  table$table.Short.wave.downward..GLOBAL..radiation..W.m..2. <- NULL
  table$table.Direct.radiation..W.m..2. <- NULL
  
  return(table)
}

ber <- LoadBSRNTable("BER_2003-06_0100.txt")

# Produce daily sums
###############################################################################

GetDay <- function (dataframe, line) {
  # Returns an integer of the day value in a BSRN table at the given line
  # 
  # Args:
  #   dataframe: The dataframe to be used
  #   line: The line to look the day up from
  #
  # Returns:
  #   The day of that line as an integer
  return(as.integer(substr(dataframe$timestamp[line], 9, 10)))
}

GetDailySums <- function(dataframe, variable) {
  # Returns a vector of the daily sums of a given variable in a BSRN table
  #
  # Args:
  #   dataframe (dataframe): The dataframe to be used
  #   variable (vector): The variable to look up in the dataframe
  #
  # Returns:
  #   A vector containing the daily sums of SIS for the station table
  #   A vector containing the daily sums of SID for the station table
  
  # Position in table
  i <- 0
  daily.sums <- c()
  # For each day in range:
  last.day <- GetDay(dataframe, length(dataframe$timestamp))
  for (day in 1:last.day) {
    # Position in day
    j <- 0
    next.day <- day
    day.values <- c()
    while(!invalid(next.day) && day == next.day) {
      i <- i + 1
      j <- j + 1
      next.day <- GetDay(dataframe, i + 1)
      day.values[j] <- variable[i]
    }
    # Divide by 60, since each measurement counts for a single minute
    daily.sums[day] <- sum(day.values, na.rm=T)/60
  }
  return(daily.sums)
}

sid <- GetDailySums(ber, ber$sid)
sis <- GetDailySums(ber, ber$sis)

# Make data frame of daily sums
###############################################################################

StationDataFrame <- function(table.name) {
  # Make a data frame of daily sums from a BSRN table
  #
  # Args:
  #   table.name: Path to the BSRN table
  #
  # Returns:
  #   A data frame containing daily sums of SIS and SIS for the BSRN station
  
  # Read table
  dataframe <- LoadBSRNTable(table.name)
  # Compute daily sums
  sis <- GetDailySums(dataframe, dataframe[,4])
  sid <- GetDailySums(dataframe, dataframe[,5])
  
  header <- c("lat", "lon", "day", "sis", "sid")
  month.length <- length(sid)
  month <- t(data.frame(dataframe$lat[1:month.length], 
                        dataframe$lon[1:month.length], 
                        c(1:month.length), 
                        sis, 
                        sid))
  row.names(month) <- header
  return(t(month))
}

bil <- StationDataFrame("BIL_2003-06_0100.txt")
write.table(bil, file="/home/lee/test.csv", sep=',', row.names=F)

###############################################################################
# Produce monthly sums

MonthlySums <- function(dataframe) {
  # Makes monthly sums from a data frame of 1 month of daily sums
  #
  # Args:
  #   dataframe: The data frame to produce the sums from
  #
  # Returns:
  #   A data frame with the same fields as the input data frame
  monthly.sums <- data.frame(dataframe[1,1], 
                             dataframe[1,2], 
                             sum(dataframe[,4]), 
                             sum(dataframe[,5]))
  row.names(monthly.sums) <- row.names(dataframe)
  return(monthly.sums)
}

sums <- MonthlySums(bil)