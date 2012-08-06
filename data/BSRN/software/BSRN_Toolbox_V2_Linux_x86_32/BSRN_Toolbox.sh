#!/bin/sh

# script to run BSRN Toolbox on a Linux (i586) system

# C 2009 Rainer Sieger,
#        Alfred Wegener Institute for Polar and Marine Research,
#        Bremerhaven, Germany
#        Email: rsieger@pangaea.de

# set LD_LIBRARY_PATH
appname=`basename $0 | sed s,\.sh$,,`

dirname=`dirname $0`
tmp="${dirname#?}"

if [ "${dirname%$tmp}" != "/" ]; then
dirname=$PWD/$dirname
fi
LD_LIBRARY_PATH=$dirname/bin
export LD_LIBRARY_PATH
$dirname/bin/$appname $*

