zThreader
=========

JavaScript "threading" library for maintaining application responsiveness during heavy operations!

In JavaScript, there is sadly no "real" threading available, and Workers provide only limited functionality (and annoyance)
as they operate "in their own space", separated from the remainder of your application.

To overcome this, zThreader has been created. A "zThread" is basically a base "class" that can be extended / implemented
to subdivide a processor-heavy operation into smaller iterations, which will be executed whenever the web browser has CPU
resources available. In other words : you can enjoy the number crunching of your ultra cool heavy operation(s), while still
keeping the user interface of your application responsive while the operation is running. Additionally, you can create
Java / C-style "daemon" operations (the type that never finish and are running as an eternal "while"-loop, which would otherwise
lock script execution when done in JavaScript), finally allowing you to create your awesome "eternally generating new Mandelbrots"-application!.

Granted, this form of "fake threading" takes longer to execute as opposed to running the operation in one go, but the benefits
of keeping your application feel smooth and responsive PLUS overcoming the dreaded crash as script execution timeouts occur,
should make you consider using this approach. Clever benchmarking of your custom operations can make the extra processing
time actually negligible!

When in doubt, check the live demos below.

Dependencies
============

zThreader requires no other JavaScript libraries and thus can be used within any context. There is no super secret
"HTML5"-stuff going on either, so it should work on pretty much anything including Internet Explorer 6 (!). Having said
that, to leverage CPU consumption, zThreader uses requestAnimationFrame. If your project is to support older browsers
without this feature, you can easily use a shim / polyfill for requestAnimationFrame and still use zThreader.

Documentation
=============

Want to view the API ? You can check the wiki here : https://github.com/igorski/zThreader/wiki/zThreader-overview

LIVE DEMOS
==========

Demo 1:

Here we run twos daemon-style thread and observe neither is blocking the remainder of the application.

https://rawgithub.com/igorski/zThreader/master/examples/demo1.html

Demo 2:

Here you can view and compare the zThreader with a non-threaded execution, and even test multiple instances of zThreaded operations
running at the same time, while maintaining a responsive UI throughout!

https://rawgithub.com/igorski/zThreader/master/examples/demo2.html
