#!/bin/bash
sudo docker stop api
sudo docker stop frontend
sudo docker rm api
sudo docker rm frontend
sudo docker build -f Docker/docker_frontend/Dockerfile -t nieb/frontend .
sudo docker build -f Docker/docker_api/Dockerfile -t nieb/api .
