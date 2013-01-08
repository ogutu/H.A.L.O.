# Script to combine GOES-W, GOES-E, Meteosat Prime, Meteosat IODC and GMS imagery
# into one single image from approximately the same time.
# Daniel Lee, 21.12.2012

# Assign variables
# Path to cdo executable
cdo=$1
input_path=$2
output_path=$3
satellite_name=$4
year=$5
start_day=$6
end_day=$7
scan_minute=$8
border_west=$9
border_east=${10}

for ((doy=$start_day; doy<=$end_day; doy++))
do
    for hour in 00 01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 \
        21 22 23
    do
        # Enter input folder
        echo cd $input_path
        cd $input_path

        scan_identifier=$satellite_name"."$year"."$doy"."$hour$scan_minute

        # Crop image
        echo $cdo sellonlatbox,$border_west,$border_east,-63,63 \
            $scan_identifier"G.out.nc" $output_path"/"$scan_identifier".out.nc"
        $cdo sellonlatbox,$border_west,$border_east,-63,63 \
            $scan_identifier"G.out.nc" $output_path"/"$scan_identifier".out.nc"

        cd $output_path
        # Extract variables
        echo $cdo splitname $scan_identifier".out.nc" $scan_identifier
        $cdo splitname $scan_identifier".out.nc" $scan_identifier

        # Convert to GeoTIFF
        for variable in G B
        do 
            echo gdal_translate -a_srs "EPSG:4326" \
            $scan_identifier$variable".nc" $scan_identifier$variable".tif"
            gdal_translate -a_srs "EPSG:4326" $scan_identifier$variable".nc" \
                $scan_identifier$variable".tif"
            # Cleanup
            echo rm $scan_identifier$variable".nc"
            rm $scan_identifier$variable".nc"
        done

        # Cleanup
        echo rm $scan_identifier".out.nc"
        rm $scan_identifier".out.nc"
        echo ""
    done
done

# Examples:
# GMS:
# goes_to_geotiff.sh /home/dlee/data/lib/cdo/bin/cdo /home/dlee/data/goes_data/gms/062003_allsky /home/dlee/data/homogenized goes09 2003 152 181 25 106 180
# GOES-W:
# goes_to_geotiff.sh /home/dlee/data/lib/cdo/bin/cdo /home/dlee/data/goes_data/goes-w/062003_allsky /home/dlee/data/homogenized goes10 2003 152 181 00 -180 -134
# GOES-E:
# goes_to_geotiff.sh /home/dlee/data/lib/cdo/bin/cdo /home/dlee/data/goes_data/goes-e/062003_allsky /home/dlee/data/homogenized goes12 2003 152 181 45 -134 -37
