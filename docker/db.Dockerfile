FROM postgres:18

RUN apt-get update &&  \ 
  apt-get -y install postgresql-18-cron && \ 
  apt-get clean \ 
  && rm -rf /var/lib/apt/lists/*