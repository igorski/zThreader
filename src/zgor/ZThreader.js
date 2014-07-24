/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2014 Igor Zinken / igorski
 *
 * taking inspiration from the ActionScript3 Greenthreader by Charles E Hubbard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var zgor = zgor || {};

// cache reference to animation frame, in case you wish to use this application
// on older browsers without animationFrame support, you can rely on setTimeout/setInterval-polyfills
// such as the excellent ones by Paul Irish, Tino Zijdel and Erik Möller

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.cancelAnimationFrame  = window.cancelAnimationFrame  || window.mozCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame;

/**
 * zThreader functions as a "static class", managing individual
 * zThreads and delegating their execution in separate iterations.
 *
 * @typedef {{
 *              init: Function,
 *              add: Function,
 *              remove: Function,
 *              run: Function,
 *              stop: Function,
 *              getAmountOfThreads: Function,
 *              hasThread: Function,
 *              setPriority: Function,
 *              execute: Function,
 *              _threads: Array,
 *              _fps: number,
 *              _executeInterval: number,
 *              _lastExecution: number,
 *              _priority: number,
 *              _requestId: number
 *          }}
 */
zgor.ZThreader =
{
    /**
     * prepares the ZThreader for use
     *
     * @public
     *
     * @param {number} aPriority the percentage (0-1 range) of priority we
     *        give the threader upon each cycle, the higher the percentage
     *        the less CPU resources will be left to the UI
     * @param {number=} aDesiredFrameRate desired framerate we'd like
     *        to run the application in (basically we allow the ZThreader
     *        only as much CPU cycles to ensure the rendering of the application
     *        can run smoothly at the specified framerate) this defaults to 60 fps
     */
    init : function( aPriority, aDesiredFrameRate )
    {
        var self = zgor.ZThreader;

        self.setPriority( aPriority );
        self._fps = aDesiredFrameRate || 60;
        self._executeInterval = 1000 / self._fps;
    },

    /**
     * register a new ZThread for running
     *
     * @public
     *
     * @param {zgor.ZThread} aThread
     * @return {boolean} whether thread has been added
     */
    add : function( aThread )
    {
        var self = zgor.ZThreader;

        if ( !self.hasThread( aThread ))
        {
            self._threads.push( aThread );

            // start running if this is the first thread in the ZThreader
            // (meaning the ZThreader was previously idle)

            if ( self._threads.length === 1 ) {
                self.run();
            }
            return true;
        }
        return false;
    },

    /**
     * remove a registered ZThread
     *
     * @public
     *
     * @param {zgor.ZThread} aThread
     * @return {boolean} whether thread has been found and removed
     */
    remove : function( aThread )
    {
        var threads = zgor.ZThreader._threads;
        var i       = threads.length;
        var spliced = false;

        while ( i-- )
        {
            if ( threads[ i ] == aThread )
            {
                threads.splice( i, 1 );
                spliced = true;
                break;
            }
        }

        // if no threads remain, stop running

        if ( spliced && threads.length === 0 )
        {
            zgor.ZThreader.stop();
        }
        return false;
    },

    /**
     * adds the timer and starts processing
     * all threads
     *
     * NOTE : if application is supposed to run in older
     * browsers that don't support RequestAnimationFrame
     * you can easily use a polyfill/shim that uses a
     * setTimeout/setInterval-fallback
     *
     * @private
     */
    run : function()
    {
        zgor.ZThreader._requestId = requestAnimationFrame( zgor.ZThreader.execute );
    },

    /**
     * removes all running threads
     * and removes timer
     *
     * @public
     */
    stop : function()
    {
        zgor.ZThreader._threads = [];

        cancelAnimationFrame( zgor.ZThreader._requestId );
    },

    /**
     * retrieve the number of active threads
     *
     * @public
     *
     * @return {number}
     */
    getAmountOfThreads : function()
    {
        return zgor.ZThreader._threads.length;
    },

    /**
     * query whether a specific ZThread has been
     * registered for threading (and thus: is running)
     *
     * @public
     *
     * @param {zgor.ZThread} aThread
     * @return {boolean} whether thread has been found
     */
    hasThread : function( aThread )
    {
        var threads = zgor.ZThreader._threads;
        var i       = threads.length;

        while ( i-- )
        {
            if ( threads[ i ] == aThread ) {
                return true;
            }
        }
        return false;
    },

    /**
     * @public
     * @param {number} aPercentage in 0-1 range
     */
    setPriority : function( aPercentage )
    {
        zgor.ZThreader._priority = aPercentage;
    },

    /* private methods */

    /**
     * called by the timing function, this is what
     * actually runs all the threads, and shouldn't be
     * invoked manually (use "start" instead)
     *
     * @private
     */
    execute : function()
    {
        var self  = zgor.ZThreader;
        var now   = +new Date();
        var delta = now - self._lastExecution;

        // only execute when it is our allotted time...
        if ( delta > self._executeInterval )
        {
            self._lastExecution = now - ( delta % self._executeInterval );

            var threads        = self._threads;
            var threadAmount   = threads.length;
            var timeAllocation = self._priority < 1 ? ( 1000 / self._executeInterval ) * self._priority + 1 : self._fps - self._priority;

            timeAllocation = Math.max( timeAllocation, threadAmount );

            var processAllocation = timeAllocation / threadAmount;

            var i = threadAmount;

            while ( i-- )
            {
                var thread = threads[ i ];

                if ( thread.execute( processAllocation ))
                {
                    if ( self._threads.length >= 0 ) {
                        processAllocation = timeAllocation / self._threads.length;
                    }
                }
            }
            // calculate the total execution time
            var elapsed = +new Date() - now;
        }
        // queue next cycle (run-method basically functions as a
        // "step"-function once it has commenced running
        if ( threads.length > 0 ) {
            zgor.ZThreader.run();
        }
    },

    /**
     * @private
     * @type {Array.<zgor.ZThread>}
     */
    _threads : [],

    /**
     * the desired "framerate" we'd like to
     * run the application at (i.e. we use this to
     * calculate the iterations for each thread)
     *
     * @private
     * @type {number}
     */
    _fps : 60,

    /**
     * @private
     * @type {number}
     */
    _executeInterval : ( 1000 / 60 ),

    /**
     * timestamp of the last execution cycle
     *
     * @private
     * @type {number}
     */
    _lastExecution : 0,

    /**
     * the percentage (range 0-1) of CPU cycles
     * we will allocate to executing the threaded methods
     *
     * @private
     * @type {number}
     */
    _priority : .4,

    /**
     * @private
     * @type {number}
     */
    _requestId : -1
};
