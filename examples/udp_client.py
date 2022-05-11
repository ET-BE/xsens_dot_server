import socket

client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

client.settimeout(1.0)

addr = ("127.0.0.1", 56830)
client.bind(addr)

data, server = client.recvfrom(4096)

print(data)

print(server)

client.close()
