#!/bin/bash
sudo docker stop api
sudo docker stop frontend
sudo docker stop api-sim
sudo docker rm api
sudo docker rm frontend
sudo docker rm api-sim
sudo docker build -f Docker/docker_frontend/Dockerfile -t nieb/frontend .
sudo docker build -f Docker/docker_api/Dockerfile -t nieb/api .
sudo docker build -f Docker/docker_api_simulator/Dockerfile -t nieb/api-sim .
