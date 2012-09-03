 /* This is adapted from the netCDF tutorial, to read solar irradiance files from CM-SAF */
 
 
 
 /* This is part of the netCDF package.
        Copyright 2006 University Corporation for Atmospheric Research/Unidata.
        See COPYRIGHT file for conditions of use.
     
        This is an example which reads some surface pressure and
        temperatures. The data file read by this program is produced by the
        companion program sfc_pres_temp_wr.c. It is intended to illustrate
        the use of the netCDF C API.
     
        This program is part of the netCDF tutorial:
        http://www.unidata.ucar.edu/software/netcdf/docs/netcdf-tutorial
     
        Full documentation of the netCDF C API can be found at:
        http://www.unidata.ucar.edu/software/netcdf/docs/netcdf-c
     
        $Id: sfc_pres_temp_rd.c,v 1.5 2007/02/14 20:59:21 ed Exp $
     */
     
     #include <stdio.h>
     #include <stdlib.h>
     #include <string.h>
     #include <netcdf.h>
     
     #define LATDIM_NAME "yc"
     #define LONDIM_NAME "xc"
     #define LAT_NAME "lat"
     #define LON_NAME "lon"
     #define TIME_NAME "time"
     #define TEM_NAME "data"

	#define HOUR_1979_START 692496
     
     /* For the units attributes. */
     #define UNITS "units"
     #define LAT_UNITS "degrees_north"
     #define LON_UNITS "degrees_east"
     #define MAX_ATT_LEN 80
     
     /* Handle errors by printing an error message and exiting with a
      * non-zero status. */
     #define ERR(e) {printf("Error: %s\n", nc_strerror(e)); return 2;}
     

int ReadDims(int ncid, int *lat_varid, size_t *lat_length, int *lon_varid, size_t *lon_length, 
		int *time_varid, size_t *time_length)
	{

	int retval=0;
		
        /* Get the varids of the latitude and longitude coordinate
         * variables. */
        if ((retval = nc_inq_varid(ncid, LAT_NAME, lat_varid)))
           return retval;
        if ((retval = nc_inq_varid(ncid, LON_NAME, lon_varid)))
           return retval;
        if ((retval = nc_inq_varid(ncid, TIME_NAME, time_varid)))
           return retval;

	/* Get dimension lengths */
	nc_inq_dimlen(ncid,*lat_varid,lat_length);
	nc_inq_dimlen(ncid,*lon_varid,lon_length);
	nc_inq_dimlen(ncid,*time_varid,time_length);
	
	return retval;
	}

int ReadDimsAndData(int ncid, int lat_varid, int lon_varid, int time_varid, int tem_varid, float *lats_in, 
				float *lons_in, int *time_in, float *temp_in)
	{
	int retval=0;

	
	/* Read the coordinate variable data. */

/*	
	if ((retval = nc_get_var_float(ncid, lat_varid, lats_in)))
           ERR(retval);
        if ((retval = nc_get_var_float(ncid, lon_varid, lons_in)))
           ERR(retval);
*/
	/* Read the list of times. */
        if ((retval = nc_get_var_int(ncid, time_varid, time_in)))
           ERR(retval);
	
	/* Read the radiation data. */
        if ((retval = nc_get_var_float(ncid, tem_varid, temp_in)))
           ERR(retval);

	return 0;
	}

int DateAndTime(int time_in_seconds, int *year, int *month, int *day, int *hour, int *minute)
	{
	int startYear=1970;
	int startMonth=0;
	int monthlength[12]={31,28,31,30,31,30,31,31,30,31,30,31};
	
	
	if(time_in_seconds<0)
		return 1;
	
	while(time_in_seconds>=31622400) 
		{
		time_in_seconds-=31536000;

		if(startYear%4==0)
			{
			time_in_seconds-=86400;
			}
		startYear++;
		}
	if((time_in_seconds>=31536000)&&(startYear%4!=0))
		{
		time_in_seconds-=31536000;
		startYear++;
		}
		
	/* Now we have the year, find the month */	

	if(startYear%4==0)
		monthlength[1]++;
	
	while(time_in_seconds>=86400*monthlength[startMonth])
		{
		time_in_seconds-=86400*monthlength[startMonth];
		startMonth++;
		}




	*day=(int) (time_in_seconds/86400);

	time_in_seconds-=86400*(*day);
	
	
	(*day)++;
	
	*hour=(int) (time_in_seconds/3600);

	time_in_seconds-=3600*(*hour);

	*minute=(int) (time_in_seconds/60);
	
	*month=startMonth+1;
	
	*year=startYear;
	
	return 0;
	}


int main(int argc, char **argv)
     {

	int fnum;
	int offset;
	int year, month, day, hour, minute;
	int ncid, time_varid, tem_varid;
        int lat_varid, lon_varid;
	int totvals;
	int row,col, time;
	size_t lat_length=10819;
	size_t lon_length=20836;
	size_t time_length=1;
	size_t lat_length_ref, lon_length_ref, time_length_ref;
     
        /* We will read surface solar radiation field. */
        float *tem_in=NULL;
	float *tempoin;
	
        /* For the lat lon coordinate variables as well as the time. */
        float *lats_in=NULL, *lons_in=NULL;
	int *times_in=NULL;
     
        /* To check the units attributes. */
	char outfilename[1024];
	
	FILE *outfile;
     
	sscanf(argv[1],"%d", &lon_length);
	sscanf(argv[2],"%d", &lat_length);
     
        /* Error handling. */
        int retval;
     
	

	for(fnum=3;fnum<argc;fnum++)
		{
		printf("Processing file: %s\n", argv[fnum]);

	
		/* Open the file. */
		if ((retval = nc_open(argv[fnum], NC_NOWRITE, &ncid)))
		ERR(retval);

		ReadDims(ncid, &lat_varid, &lat_length, &lon_varid, &lon_length, &time_varid, &time_length);

		/* Get the varids of the pressure and temperature netCDF
		* variables. */
		if ((retval = nc_inq_varid(ncid, TEM_NAME, &tem_varid)))
			ERR(retval);
/*
		if ((retval = nc_get_att_double(ncid, tem_varid, "scale_factor", &scale_factor)))
			ERR(retval);
		if ((retval = nc_get_att_double(ncid, tem_varid, "add_offset", &temp_offset)))
			ERR(retval);
*/
		
		totvals=lat_length*lon_length*time_length;
	
		if(!lats_in)
		{

			lats_in= (float *) malloc(sizeof(float)*lat_length);
			lons_in= (float *) malloc(sizeof(float)*lon_length);
			times_in= (int *) malloc(sizeof(int)*time_length);
			tem_in= (float *) malloc(sizeof(float)*totvals);
			lat_length_ref=lat_length;
			lon_length_ref=lon_length;
			time_length_ref=time_length;
		}
		
		if(lat_length>lat_length_ref)
			lats_in= (float *) realloc(lats_in,sizeof(float)*lat_length);
		if(lon_length>lon_length_ref)
			lons_in= (float *) realloc(lons_in,sizeof(float)*lon_length);
		if(time_length>time_length_ref)
			times_in= (int *) realloc(lons_in,sizeof(int)*time_length);
		if(totvals>lon_length_ref*lat_length_ref*time_length_ref)
			tem_in= (float *) realloc(tem_in,sizeof(float)*totvals);
			
		
		lat_length_ref=lat_length;
		lon_length_ref=lon_length;
		time_length_ref=time_length;
		
		ReadDimsAndData(ncid, lat_varid, lon_varid, time_varid, tem_varid, lats_in, 
					lons_in, times_in, tem_in);


					
		/* Close the file. */
		if ((retval = nc_close(ncid)))
		ERR(retval);

			/* Now we can write out the sums and the counts, in .asc format */
		tempoin=tem_in;
		for(time=0;time<time_length_ref;time++)
			{
			
			DateAndTime(times_in[time],&year,&month,&day,&hour,&minute);
			
			sprintf(outfilename,"raw_%04d%02d%02d_%02d%02d.asc",year,month,day,hour,minute);
		
			offset=time*lat_length*lon_length;
			
			outfile=fopen(outfilename,"w");

			fprintf(outfile,"ncols        %d\n", lon_length);
			fprintf(outfile,"nrows        %d\n", lat_length);
			fprintf(outfile,"xllcorner    0\n");
			fprintf(outfile,"yllcorner    0\n");
			fprintf(outfile,"cellsize     1\n");
			fprintf(outfile,"nodata_value -9999\n");


			for(row=0;row<lat_length;row++)
				{
				for(col=0;col<lon_length;col++)
					{
					if(tempoin[row*lon_length+col]>-32000)
						fprintf(outfile,"%.2f ",tempoin[row*lon_length+col]);
					else
						fprintf(outfile,"%f ",-9999.);
					}
				fprintf(outfile,"\n");
				}
			tempoin+=lat_length*lon_length;
			fclose(outfile);
			}

		
		}
     

	/*
	free(lats_in);
	free(lons_in);
	*/



        return 0;
     }
