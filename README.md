Nexus
=====

The GPII Nexus Integration Technology, allowing the interconnection of arbitrary sources and sinks of state via HTTP and WebSockets.

See: https://wiki.gpii.net/w/Nexus_API

Running Nexus
-------------

Please note that at this stage of development, some of the Nexus
endpoints enable arbitrary JavaScript to be sent to the Nexus over
HTTP to be run within the Nexus Node.js process. Therefore, it is
recommended that the Nexus be run within a Virtual Machine. A Vagrant
configuration is provided for running Nexus.

- `vagrant up` - install dependencies and run Nexus within a VM
- `vagrant halt` - stop the VM
- `vagrant destroy` - delete the VM

For more information on the use of Vagrant, please see:
https://github.com/GPII/qi-development-environments

Running the tests in a VM
-------------------------

To run the Nexus tests in a VM:

- Ensure that the VM is running (`vagrant up`); then
- `grunt tests`

Trying it out
-------------

Prerequisites:

- curl (or other HTTP client)
- [wscat](https://www.npmjs.com/package/wscat) (or other WebSocket client)

In this example, we will construct a new component, register 2 model
listeners, and send a model update.

Start Nexus and make a POST request to construct a new component:

```
$ vagrant up
$ curl -H 'Content-Type: application/json' -d '{ "type": "fluid.modelComponent", "model": { "a": null } }' http://localhost:9081/components/example1
```

Next we will make WebSocket Bind Model connections to the constructed component. Set up 2 connections by executing the following in 2 separate terminals:

```
$ wscat -c ws://localhost:9081/bindModel/example1/a
```

And we can send an update message from one of the `wscat` sessions with:

```
> { "path": "", "value": "hello" }
```

If everything is working, we should see "hello" echoed back in both `wscat` sessions.

Finally, stop Nexus with:

```
$ vagrant halt
```
