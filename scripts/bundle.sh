#!/bin/bash

# Get the project root directory
DIR="."

# Get the current directory name
DIR_NAME='chrome-extension-click-to-component'
# Get the current date and time
DATETIME=$(date +"%Y-%m-%d-%H-%M-%S")

# Create a zip file with the current date and time, excluding .git, promo, and screenshots folders
zip -r ../$DIR_NAME-$DATETIME.zip * -x $DIR/.git\* $DIR/promo\* $DIR/screenshots\* $DIR/scripts\*

# Print the path of the zip file
echo "Zip file created at $DIR/$DIR_NAME-$DATETIME.zip"

# Open the zip file
open $DIR/$DIR_NAME-$DATETIME.zip
