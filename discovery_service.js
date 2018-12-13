"use strict";
/// <reference path="../rpos-gateway.d.ts"/>
/// <reference path="../typings/main.d.ts"/>
/*
The MIT License(MIT)

Copyright(c) 2016 Roger Hardiman

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files(the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject tothe following conditions:

    The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/* WS-Discovery */
/* Listens on Port 3702 on 239.255.255.0 for UDP WS-Discovery Messages */
var dgram = require("dgram");
var uuid = require("uuid");
var xml2js = require("xml2js");
var DiscoveryService = /** @class */ (function () {
    function DiscoveryService(config) {
        this.config = config;
    }
    DiscoveryService.prototype.start = function () {
        var discover_socket = dgram.createSocket('udp4');
        discover_socket.on('error', function (err) {
            throw err;
        });
        discover_socket.on('message', function (received_msg, rinfo) {
            console.debug("Discovery received");
            // Filter xmlns namespaces from XML before calling XML2JS
            var filtered_msg = received_msg.toString().replace(/xmlns(.*?)=(".*?")/g, '');
            var parseString = xml2js.parseString;
            var strip = xml2js['processors'].stripPrefix;
            parseString(filtered_msg, { tagNameProcessors: [strip] }, function (err, result) {
                var probe_uuid = result['Envelope']['Header'][0]['MessageID'][0];
                var probe_type = "";
                try {
                    probe_type = result['Envelope']['Body'][0]['Probe'][0]['Types'][0];
                }
                catch (err) {
                    probe_type = ""; // For a VMS that does not send Types
                }
                if (probe_type === "" || probe_type.indexOf("NetworkVideoTransmitter") > -1) {
                    var reply = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n          <SOAP-ENV:Envelope \n              xmlns:SOAP-ENV=\"http://www.w3.org/2003/05/soap-envelope\" \n              xmlns:wsa=\"http://schemas.xmlsoap.org/ws/2004/08/addressing\" \n              xmlns:d=\"http://schemas.xmlsoap.org/ws/2005/04/discovery\" \n              xmlns:dn=\"http://www.onvif.org/ver10/network/wsdl\">\n              <SOAP-ENV:Header>\n                  <wsa:MessageID>uuid:" + uuid.v1() + "</wsa:MessageID>\n                  <wsa:RelatesTo>" + probe_uuid + "</wsa:RelatesTo>\n                  <wsa:To SOAP-ENV:mustUnderstand=\"true\">http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To>\n                  <wsa:Action SOAP-ENV:mustUnderstand=\"true\">http://schemas.xmlsoap.org/ws/2005/04/discovery/ProbeMatches</wsa:Action>\n                  <d:AppSequence SOAP-ENV:mustUnderstand=\"true\" MessageNumber=\"68\" InstanceId=\"1460972484\"/>\n              </SOAP-ENV:Header>\n              <SOAP-ENV:Body>\n                  <d:ProbeMatches>\n                      <d:ProbeMatch>\n                          <wsa:EndpointReference>\n                              <wsa:Address>urn:uuid:" + 'hello-world' + "</wsa:Address>\n                          </wsa:EndpointReference>\n                          <d:Types>dn:NetworkVideoTransmitter</d:Types>\n                          <d:Scopes>                    onvif://www.onvif.org/type/video_encoder                    onvif://www.onvif.org/type/ptz                    onvif://www.onvif.org/hardware/BMI                    onvif://www.onvif.org/name/GateWay                    onvif://www.onvif.org/location/beijing                  </d:Scopes>\n                          <d:XAddrs>http://" + 'hello-world' + "/onvif/device_service</d:XAddrs>\n                          <d:MetadataVersion>1</d:MetadataVersion>\n                      </d:ProbeMatch>\n                  </d:ProbeMatches>\n              </SOAP-ENV:Body>\n          </SOAP-ENV:Envelope>";
                    var reply_bytes = new Buffer(reply);
                    return discover_socket.send(reply_bytes, 0, reply_bytes.length, rinfo.port, rinfo.address);
                }
            });
        });
        discover_socket.bind(3702, '239.255.255.250', function () {
            discover_socket.addMembership('239.255.255.250');
        });
        console.info("discovery_service started");
    };
    ;
    return DiscoveryService;
}()); // end class Discovery
module.exports = DiscoveryService;
