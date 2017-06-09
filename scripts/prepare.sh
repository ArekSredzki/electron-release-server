#!/usr/bin/env bash

rm environment.sh

# if database url is set
if [ "$DATABASE_URL" != "" ]
then
  # Update config
  echo "export DB_HOST=`echo $DATABASE_URL | cut -d@ -f2 | cut -d: -f1`" >> environment.sh
  echo "export DB_PORT=`echo $DATABASE_URL | cut -d@ -f2 | cut -d: -f2 | cut -d/ -f1`" >> environment.sh
  echo "export DB_USERNAME=`echo $DATABASE_URL | cut -d@ -f1 | cut -d/ -f3 | cut -d: -f1`" >> environment.sh
  echo "export DB_PASSWORD=`echo $DATABASE_URL | cut -d@ -f1 | cut -d/ -f3 | cut -d: -f2`" >> environment.sh
  echo "export DB_NAME=`echo $DATABASE_URL | cut -d@ -f2 | cut -d: -f2 | cut -d/ -f2`" >> environment.sh
else
  echo "echo DATABASE_URL not set. using environment variables." >> environment.sh
fi
