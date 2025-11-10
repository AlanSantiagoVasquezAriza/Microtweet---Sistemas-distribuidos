#!/bin/bash

echo "🧹 Microtweet Cleanup Script"
echo "============================"

read -p "This will stop all services and remove containers, volumes, and images. Continue? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Stopping services..."
    docker-compose down
    
    echo "🗑️  Removing volumes..."
    docker-compose down -v
    
    echo "🗑️  Removing images..."
    docker-compose down --rmi all
    
    echo "✓ Cleanup complete!"
else
    echo "Cleanup cancelled."
fi