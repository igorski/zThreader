/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2010-2014 Igor Zinken / igorski
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
define( "zThread", function()
{
    "use strict";

    /**
     * @constructor
     *
     * @param {!Function=} aCallback optional callback to execute once
     *        this thread has finished running its actions
     */
    var zThread = function( aCallback )
    {
        if ( aCallback ) {
            this._callback = aCallback;
        }
    };

    /* class properties */

    /** @protected @type {!Function} */ zThread.prototype._callback;
    /** @protected @type {number} */    zThread.prototype._iterations = 0;
    /** @protected @type {number} */    zThread.prototype._sleepTimeout;
    /** @protected @type {boolean} */   zThread.prototype._suspended = false;
    /** @protected @type {boolean} */   zThread.prototype._paused    = false;

    /* public methods */

    /**
     * starts running this thread
     *
     * @public
     */
    zThread.prototype.run = function()
    {
        if ( zThreader.add( this )) {
            this._iterations = 0;
        }
    };

    /**
     * halts thread execution and removes thread from zThreader
     *
     * @public
     */
    zThread.prototype.stop = function()
    {
        zThreader.remove( this );
    };

    /**
     * pauses thread execution, this will postpone thread
     * execution (and leave more CPU resources to other threads)
     * until unpause has been invoked
     *
     * @public
     */
    zThread.prototype.pause = function()
    {
        this._paused = true;
    };

    /**
     * unpauses previously halted thread execution
     *
     * @public
     */
    zThread.prototype.unpause = function()
    {
        this._paused = false;
    };

    /**
     * invoked by the ZThreader when this thread hits its
     * allocated time slot
     *
     * @public
     *
     * @param {number} aAllocatedTime amount of time allocated to this thread
     *
     * @return {boolean} whether this thread has completed its actions and can be
     *                   removed from the ZThreader. if the thread is to continue
     *                   running (either indefinitely or onto a next iteration)
     *                   value false should be returned
     */
    zThread.prototype.execute = function( aAllocatedTime )
    {
        var startTime = +new Date();

        while (( +new Date() - startTime ) < aAllocatedTime )
        {
            if ( this._executeInternal() )
            {
                // completed execution ? invoke complete handler (invokes
                // registered callback and removes this thread from the ZThreader)

                this.handleComplete();
                return true;
            }
        }
        return false;
    };

    /**
     * suspend thread execution for a given timeout
     *
     * @public
     * @param {number} aTimeout in milliseconds
     */
    zThread.prototype.sleep = function( aTimeout )
    {
        clearTimeout( this._sleepTimeout );

        this._suspended = true;
        var self        = this;

        this._sleepTimeout = setTimeout( function()
        {
            self._suspended = false;

        }, aTimeout );
    };

    /**
     * query whether this thread can be executed
     *
     * @public
     *
     * @return {boolean}
     */
    zThread.prototype.isExecutable = function()
    {
        return !this._suspended && !this._paused;
    };

    /* protected methods */

    /**
     * @protected
     *
     * @return {boolean} whether this thread has completed its actions and can be
      *                  removed from the ZThreader
     */
    zThread.prototype._executeInternal = function()
    {
        // override in subclass to track progress and return
        // state update as desired
        return false;
    };

    /**
     * invoke when this thread has finished its actions
     *
     * @protected
     */
    zThread.prototype.handleComplete = function()
    {
        // remove this thread from ZThreader
        this.stop();

        // execute callback if one was registered
        if ( this._callback != null ) {
            this._callback();
        }
    };

    return zThread;
});
