# onvifmulticast

udp多播和onvif发现设备多播

server监听1234端口，并加入`239.255.255.250`多播组，收到请求后会回复给发送端并在消息前加上`ip`和`response`。
client端口绑定任意端口发送多播消息给`239.255.255.250`的`1234`端口并接受回复。