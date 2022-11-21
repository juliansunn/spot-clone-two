# The first instruction is what image we want to base our container on
# We Use an official Python runtime as a parent image
FROM python:3.8

RUN apt update

# The enviroment variable ensures that the python output is set straight
# to the terminal with out buffering it first
ENV PYTHONUNBUFFERED 1

# Set the working directory to /music_service
WORKDIR /sp_service


# Copy the current directory contents into the container at /music_service
COPY . ./

RUN pip install --upgrade pip

# Install any needed packages specified in requirements.txt

RUN apt-get install ca-certificates

RUN python -m venv /py && \
    /py/bin/pip install --upgrade pip && \
    /py/bin/pip install -r requirements.txt && \
    adduser --disabled-password --no-create-home sp-user

ENV PATH="/py/bin:$PATH"

USER sp-user


