# Troubleshooting RabbitMQ di Server Ubuntu

## Konfigurasi RabbitMQ Custom Port

Server menggunakan port custom untuk RabbitMQ:
- **RabbitMQ Port**: 9505 (bukan default 5672)
- **Management Port**: 9506 (bukan default 15672)

## Environment Configuration

```bash
# RabbitMQ Configuration (Custom Ports)
RABBITMQ_ENABLED=true
RABBITMQ_PORT=9505
RABBITMQ_PORT_MANAGEMENT=9506
RABBITMQ_URL=amqp://guest:guest@localhost:9505
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
RABBITMQ_QUEUE_NAME=report-management-queue
```

## Troubleshooting Steps

### 1. Check RabbitMQ Service Status

```bash
# Check if RabbitMQ is running
sudo systemctl status rabbitmq-server

# Check if it's listening on port 9505
sudo netstat -tlnp | grep 9505
# atau
sudo ss -tlnp | grep 9505
```

### 2. Check RabbitMQ Configuration

```bash
# Check RabbitMQ config file
sudo cat /etc/rabbitmq/rabbitmq.conf

# Look for port configuration
grep -i port /etc/rabbitmq/rabbitmq.conf
```

### 3. Start RabbitMQ Service

```bash
# Start RabbitMQ
sudo systemctl start rabbitmq-server

# Enable auto-start on boot
sudo systemctl enable rabbitmq-server

# Check status
sudo systemctl status rabbitmq-server
```

### 4. Test Connection

```bash
# Test connection to custom port
telnet localhost 9505

# Test with rabbitmqctl
sudo rabbitmqctl status
```

### 5. Check RabbitMQ Logs

```bash
# Check RabbitMQ logs
sudo journalctl -u rabbitmq-server -f

# Check specific log files
sudo tail -f /var/log/rabbitmq/rabbit@hostname.log
```

## Common Issues & Solutions

### Issue 1: "Socket closed abruptly during opening handshake"

**Cause**: RabbitMQ service tidak berjalan atau port salah

**Solution**:
```bash
# Start RabbitMQ service
sudo systemctl start rabbitmq-server

# Check if listening on correct port
sudo netstat -tlnp | grep 9505
```

### Issue 2: "Connection refused"

**Cause**: RabbitMQ tidak listening di port yang dikonfigurasi

**Solution**:
```bash
# Check RabbitMQ configuration
sudo cat /etc/rabbitmq/rabbitmq.conf

# Add port configuration if missing
echo "listeners.tcp.default = 9505" | sudo tee -a /etc/rabbitmq/rabbitmq.conf

# Restart RabbitMQ
sudo systemctl restart rabbitmq-server
```

### Issue 3: "Authentication failed"

**Cause**: Username/password salah

**Solution**:
```bash
# Check users
sudo rabbitmqctl list_users

# Add user if needed
sudo rabbitmqctl add_user guest guest

# Set permissions
sudo rabbitmqctl set_permissions -p / guest ".*" ".*" ".*"
```

## RabbitMQ Configuration File

Create `/etc/rabbitmq/rabbitmq.conf`:

```conf
# Listen on custom port
listeners.tcp.default = 9505

# Management plugin port
management.tcp.port = 9506

# Default user
default_user = guest
default_pass = guest

# Enable management plugin
management.load_definitions = /etc/rabbitmq/definitions.json
```

## Quick Setup Commands

```bash
# 1. Copy environment
cp environment.server .env

# 2. Start RabbitMQ
sudo systemctl start rabbitmq-server

# 3. Enable management plugin
sudo rabbitmq-plugins enable rabbitmq_management

# 4. Start application
npm run dev
```

## Monitoring

- **Management UI**: http://localhost:9506
- **Username**: guest
- **Password**: guest

## Application Logs

Check application logs for RabbitMQ connection:
```bash
# Check if RabbitMQ listener is working
tail -f logs/application/app.log | grep -i rabbitmq

# Check listener logs
tail -f logs/listener/listener-*.txt
```
