zThreader
=========

JavaScript "threading" library for maintaining application responsiveness during heavy operations!

In JavaScript, there is sadly no "real" threading available, and Workers provide only limited functionality (and annoyance)
as they operate "in their own space", separated from the remained of your application.

To overcome this, zThreader has been created. A "zThread" is basically a base "class" that can be extended / implemented
to subdivide a processor-heavy operation into smaller iterations, which will be executed whenever the web browser has CPU
resources available. In other words : you can enjoy the number crunching of your ultra cool heavy operation(s), while still
keeping the user interface of your application responsive while the operation is running.

Granted, this form of "fake threading" takes longer to execute as opposed to running the operation in one go, but the benefits
of keeping your application feel smooth and responsive PLUS overcoming the dreaded crash as script execution timeouts occur,
should make you consider using this approach. Clever benchmarking of your custom operations can make the extra processing
time actually negligible!

If in doubt, check the live demo below.

Dependencies
============

zThreader requires no other JavaScript libraries and thus can be used within any context. There is no super secret
"HTML5"-stuff going on either, so it should work on pretty much anything including Internet Explorer 6 (!). Having said
that, to leverage CPU consumption, zThreader uses requestAnimationFrame. If your project is to support older browsers
without this feature, you can easily use a shim / polyfill for requestAnimationFrame and still use zThreader.

Using oogle Closure ? Nice. Enjoy the compression
=================================================

zThreader has been annotated extensively with JSDocs, allowing the source to minimized with maximum compression when
using the Closure compiler by Google.

Documentation
=============

Want to view the API ? You can check the wiki here : https://github.com/igorski/zThreader/wiki/zThreader-overview

LIVE DEMO
=========

You can view and compare the zThreader with a non-threaded execution, and even test multiple instances of zThreaded operations
running at the same time, while maintaining a responsive UI throughout!

View the live demo here:

https://rawgithub.com/igorski/zThreader/master/examples/index.html
