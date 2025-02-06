#!/bin/bash

# Check if nvm is installed
if [ ! -f "$HOME/.nvm/nvm.sh" ]; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node.js LTS
echo "Installing Node.js LTS..."
nvm install --lts
nvm use --lts

# Verify Node.js version
node --version

# Install dependencies using pnpm
echo "Installing dependencies with pnpm..."
pnpm install
