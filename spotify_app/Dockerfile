# The first instruction is what image we want to base our container on
# We Use an official Python runtime as a parent image
FROM python:3.8

RUN apt update
# RUN apt-get install cron -y

# The enviroment variable ensures that the python output is set straight
# to the terminal with out buffering it first
ENV PYTHONUNBUFFERED 1

# create root directory for our project in the container
RUN mkdir /sp_service

# Set the working directory to /music_service
WORKDIR /sp_service

# # django-crontab logfile
# RUN mkdir /cron
# RUN touch /cron/django_cron.log

# Copy the current directory contents into the container at /music_service
ADD . /sp_service/
# COPY requirements.txt /sp_service/
# COPY backend /sp_service/

RUN pip install --upgrade pip

# Install any needed packages specified in requirements.txt

RUN apt-get install ca-certificates

RUN pip install -r requirements.txt --root-user-action=ignore


