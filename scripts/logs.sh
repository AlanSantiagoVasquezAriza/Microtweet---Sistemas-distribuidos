#!/bin/bash

# Script to easily view logs

if [ -z "$1" ]; then
    echo "📋 Viewing all service logs..."
    docker-compose logs -f
elif [ "$1" == "gateway" ]; then
    docker-compose logs -f api-gateway
elif [ "$1" == "auth" ]; then
    docker-compose logs -f auth-service
elif [ "$1" == "user" ]; then
    docker-compose logs -f user-service
elif [ "$1" == "tweet" ]; then
    docker-compose logs -f tweet-service
elif [ "$1" == "feed" ]; then
    docker-compose logs -f feed-service
elif [ "$1" == "postgres" ]; then
    docker-compose logs -f postgres
elif [ "$1" == "redis" ]; then
    docker-compose logs -f redis
else
    echo "Usage: bash scripts/logs.sh [service]"
    echo "Services: gateway, auth, user, tweet, feed, postgres, redis"
    echo "Leave empty to see all logs"
fi