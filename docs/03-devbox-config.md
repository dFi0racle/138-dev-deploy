# Dev Box Configuration

## Hardware Requirements

### Minimum Specifications
- CPU: Multi-core processor (8+ cores recommended)
- RAM: 16 GB minimum, 32 GB recommended
- Storage: 500 GB SSD minimum
- Network: 100 Mbps stable connection

### Recommended Specifications
- CPU: 16+ cores
- RAM: 64 GB
- Storage: 1 TB NVMe SSD
- Network: 1 Gbps dedicated connection

## System Configuration

### Docker Settings
```json
{
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}
```

### System Limits
Add to `/etc/security/limits.conf`:
```
*       soft    nofile      64000
*       hard    nofile      64000
```

## Network Configuration
- Enable required ports for Ethereum and Polygon nodes
- Configure firewall rules as needed
- Set up DNS resolution for blockchain endpoints
