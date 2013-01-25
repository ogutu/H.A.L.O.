# Suppress scientific notation
options(scipen=3)
RemoveNAs <- function(table) {
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
CombineTables <- function(folder) {
  # Combines all tables in a given folder and creates primary key for each entry
  #
  # Args:
  #   folder (string): The path to combine all tables from
  #
  # Returns:
  #   The tables combined as a single dataframe with primary keys
  
  setwd(folder)
  
  # Load validation values
  table.files <- list.files()
  # Make data frame structure
  output.table <- read.csv(table.files[1])
  # Remove entries
  output.table <- output.table[F,]
  # Concatenate tables
  for (table in table.files) {
    output.table <- rbind(output.table, read.csv(table))
  }
  # Make primary keys
  output.table$id <- paste(as.character(output.table$lat),
                           as.character(output.table$lon),
                           as.character(output.table$day))
  return(output.table)
}
ValidateTable <- function(predicted, observed, threshold) {
  # Computes bias, MAD, SD, AC, RMSE and fraction above threshold for dataframe
  # Observed table should be subsetted to the relevant variable
  #
  # Args:
  #   predicted (vector):  The predicted variable
  #   observed  (vector):  The matching observation
  #   threshold (numeric): The deviance threshold
  #
  # Returns:
  #   A numeric vector: c(bias, mad, sd, ac, rmse, frac)
  
  # Join tables
  validation.table <- merge(observed, predicted)
  deviance <- unlist(validation.table[6] - validation.table[5], use.names=F)
  # Bias
  bias <- 1 / length(validation.table$id) * sum(deviance)
  # MAD
  mad <- 1 / length(validation.table$id) * sum(abs(deviance))
  # Standard deviance
  sd <- sd(deviance)
  ac <- {
    observed.mean <- as.numeric(colMeans(validation.table[5]))
    predicted.mean <- as.numeric(colMeans(validation.table[6]))
    ac_1 <- sum((validation.table[6] - predicted.mean) * 
                  (validation.table[5] - observed.mean))
    ac_2 <- sqrt(sum((validation.table[6] - predicted.mean)**2))
    ac_3 <- sqrt(sum((validation.table[5] - observed.mean)**2))
    
    ac_1 / (ac_2 * ac_3)
  }
  rmse <- {
    library(hydroGOF)
    as.numeric(rmse(validation.table[6], validation.table[5]))
  }
  FractionAboveThreshold <- function(deviance.vector, threshold) {
    # Computes fraction of observations whose error is above a given threshold
    #
    # Args: 
    #   deviance.vector (numeric vector): The observed deviances
    #   threshold (numeric): Maximum deviance
    #
    # Returns:
    #   Percentage of observations above maximum deviance
    length(deviance.vector[abs(deviance.vector) > threshold]) / 
      length(deviance.vector)
  }
  # Threshold is scaled to 24 to compensate for working with W rather than Wh
  frac <- FractionAboveThreshold(deviance, threshold * 24)
  
  # TODO: Make scatterplot
  observed <- unlist(validation.table[5], use.names=F)
  predicted <- unlist(validation.table[6], use.names=F)
  plot(observed, predicted)
  regression.line <- lm(observed ~ predicted)
  abline(regression.line)
  
  # Values are divided by 24 to reduce to W / m² rather than Wh / m² * day
  c(bias / 24, mad / 24, sd / 24, ac, rmse / 24, frac)
}

{
  # Make combined tables of each folder
  bsrn <- CombineTables("~/Desktop/values_at_stations/bsrn/")
  clara <- CombineTables("~/Desktop/values_at_stations/clarasis/")
  era <- CombineTables("~/Desktop/values_at_stations/erasis/")
  goes09.sid <- CombineTables("~/Desktop/values_at_stations/goes09sid/")
  goes09.sis <- CombineTables("~/Desktop/values_at_stations/goes09sis/")
  goes12.sid <- CombineTables("~/Desktop/values_at_stations/goes12sid/")
  goes12.sis <- CombineTables("~/Desktop/values_at_stations/goes12sis/")
  msat_i.sid <- CombineTables("~/Desktop/values_at_stations/msat-isid/")
  msat_i.sis <- CombineTables("~/Desktop/values_at_stations/msat-isis/")
  msat_p.sid <- CombineTables("~/Desktop/values_at_stations/msat-psid/")
  msat_p.sis <- CombineTables("~/Desktop/values_at_stations/msat-psis/")
  
  # Subset bsrn with bsrn[,-5] (sis) bzw. bsrn[,-4] (sid)
  ValidateTable(bsrn[,-5], clara, 25)
  ValidateTable(bsrn[,-5], era, 25)
  ValidateTable(bsrn[,-5], goes09.sis, 25)
  ValidateTable(bsrn[,-5], goes12.sis, 25)
  ValidateTable(bsrn[,-5], msat_i.sis, 25)
  ValidateTable(bsrn[,-5], msat_p.sis, 25)
  
  ValidateTable(bsrn[,-4], goes09.sid, 30)
  ValidateTable(bsrn[,-4], goes12.sid, 30)
  ValidateTable(bsrn[,-4], msat_i.sid, 30)
  ValidateTable(bsrn[,-4], msat_p.sid, 30)
  
  
  # Make scatterplots!
}