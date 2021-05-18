# Service Level Agreement

Version: 1.0
Last updated: 13/05/2021

## Introduction

This Service Level Agreement applies to the MiniTwit API and is limited to the API.
The SLA will be updated on a recurring basis, but your version only renews to the latest upon using the API. The SLA in the details section provides metrics which the MiniTwit API has a history of being able to live up to.

## General Terms

* API: Application Programming Interface.
* Total Transaction Attempts: Total number of requests each month to the API by the user.
* Failed transactions: Transactions returning a server-side 5xx error message from a request.
* Monthly Uptime Percentage: (Total Transaction Attempts - Failed Transactions) / Total Transaction Attempts
* Response time: Time in seconds before a user receives feedback upon interacting with the API.

## SLA details

The metrics are measured since from the 14/04/2021 - 14/05/2021, since the architecture switched to docker swarm, providing a more reliable service.
The following metrics are to be expected of the users of Minitwit to be guaranteed:

* Monthly Uptime Percentage: 100%
* Response time on POST requests: responsese time varying from ~0.0250s to ~1.02s
* Response time on GET requests: maximum response time of 100ms
