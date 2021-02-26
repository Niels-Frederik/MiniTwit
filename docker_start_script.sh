#!/bin/bash
sudo docker stop api
sudo docker stop frontend
sudo docker stop api-sim
sudo docker rm api
sudo docker rm frontend
sudo docker rm api-sim
sudo docker run -d -p 5000:5000 --name api nieb/api
sudo docker run -d -p 3000:80 --name frontend nieb/frontend
sudo docker run -d -p 5001:5001 --name api-sim nieb/api-sim
