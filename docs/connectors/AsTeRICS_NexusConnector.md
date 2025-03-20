AsTeRICS NexusConnector
=======================

The NexusConnector is a component for AsTeRICS that provides a bi-directional connection to a GPII Nexus instance.

A Quick Introduction to AsTeRICS
--------------------------------

[AsTeRICS](http://www.asterics.eu/) is a construction set for making assistive technologies. It includes a visual construction environment and a large set of components for hardware interaction and signal processing.

Custom assistive technologies are constructed in AsTeRICS by connecting components together in a visual dataflow environment called the AsTeRICS Construction Suite (ACS). These assistive technology configurations created in the ACS are known as "models" and are executed by a separate piece of software called the AsTeRICS Runtime Environment (ARE).

The ACS provides a user interface for editing models and for communicating with a running ARE instance. The ACS can be used, for example, to load a model into an ARE and start and stop execution of a model in the ARE. The ARE can also be run independently of the ACS and the ACS is not required for the execution of a model once it has been created.

Using a NexusConnector to connect an AsTeRICS model to Nexus
------------------------------------------------------------

### 1. Add a NexusConnector component to the model

The NexusConnector is an AsTeRICS processor component and it provides 8 general-purpose input ports and 8 general-purpose output ports. Four each of type double and string:

<table>
<tr><th>Direction</th><th>Name</th><th>Type</th><th>Description</th></tr>
<tr><td>Input</td><td>in1d</td><td>Double</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in2d</td><td>Double</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in3d</td><td>Double</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in4d</td><td>Double</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in5s</td><td>String</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in6s</td><td>String</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in7s</td><td>String</td><td>Send to the Nexus</td></tr>
<tr><td>Input</td><td>in8s</td><td>String</td><td>Send to the Nexus</td></tr>
<tr><td>Output</td><td>out1d</td><td>Double</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out2d</td><td>Double</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out3d</td><td>Double</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out4d</td><td>Double</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out5s</td><td>String</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out6s</td><td>String</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out7s</td><td>String</td><td>Receive from the Nexus</td></tr>
<tr><td>Output</td><td>out8s</td><td>String</td><td>Receive from the Nexus</td></tr>
</table>

To send data to the Nexus, connect a channel to one or more of the NexusConnector inputs. And to receive data from the Nexus, connect a channel to one or more of the NexusConnector outputs.

When a value on one of the NexusConnector inputs changes, that change is relayed to the Nexus and the model of the bound peer component is updated.

And when a value, or values, change within the "outputs" section of the Nexus peer component (see below), that change is relayed to the NexusConnector and the value on the NexusConnector output ports are updated accordingly.

### 2. Configure the NexusConnector connection properties

In order to connect to a Nexus instance, we need to tell the NexusConnector the address of the Nexus instance and the name of the peer to bind to. The NexusConnector has the following configurable properties:

<table>
<tr><th>Property</th><th>Type</th><th>Description</th></tr>
<tr><td>nexusHostname</td><td>String</td><td>The address of the machine on which the Nexus is running</td></tr>
<tr><td>nexusPort</td><td>Integer</td><td>The port number on which the Nexus is listening</td></tr>
<tr><td>nexusComponentPath</td><td>String</td><td>The path of the peer component to bind to within the Nexus</td></tr>
</table>

### 3. Construct a peer component in the Nexus

To provide the connection to a Nexus instance, an AsTeRICS NexusConnector component makes a binding to a peer component within the Nexus. The corresponding Nexus peer component is expected to have a model of the following structure:

    {
        connector: {
            inputs: {
                in1d: <double value>,
                in2d: <double value>,
                in3d: <double value>,
                in4d: <double value>,
                in5s: <string value>,
                in6s: <string value>,
                in7s: <string value>,
                in8s: <string value>
            },
            outputs: {
                out1d: <double value>,
                out2d: <double value>,
                out3d: <double value>,
                out4d: <double value>,
                out5s: <string value>,
                out6s: <string value>,
                out7s: <string value>,
                out8s: <string value>
            }
        }
    }

### 4. Run the model

Once we have added a NexusConnector to the model, configured it for the Nexus address, and constructed the peer, we can run our model.

When a model containing a NexusConnector is started, the NexusConnector will initiate a WebSocket binding with the Nexus peer as configured in its properties. The peer should be constructed before the model is started.

AsTeRICS Model Deployment
-------------------------

The full installation of AsTeRICS includes the ACS and ARE. Once a model has been created with the ACS, it may be distributed and run on an another machine with the ARE installed. (Some components are platform-specific, for example some components may only be supported on a specific operating system, and in this case, a model making use of that component will be limited to certain platforms.)

In addition to distributing a model file to be run on a full installation of AsTeRICS, it is also possible to build a custom AsTeRICS distribution, tailored to run a specific model, using the [AsTeRICS Packaging Environment (APE)](https://github.com/asterics/AsTeRICS/tree/master/bin/APE).

The AsTeRICS Packaging Environment packages a model, the ARE, and only those components needed to execute the model. This provides an alternative to the full AsTeRICS installation -- a streamlined packaged version of AsTeRICS together with a specific model and only the pieces needed to run that model.

Resources
---------

- [AsTeRICS website](http://www.asterics.eu/)
- [AsTeRICS Packaging Environment](https://github.com/asterics/AsTeRICS/tree/master/bin/APE)
- [AsTeRICS on GitHub](https://github.com/asterics/AsTeRICS)
