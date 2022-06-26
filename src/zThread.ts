/**
 * The MIT License (MIT)
 *
 * Igor Zinken 2010-2014 - https://www.igorski.nl
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
import zThreader from "./zThreader";

interface zThreadProps {
    completeFn?: () => void;
    executionFn?: () => boolean;
};

export default class zThread
{
    protected _callback: () => void;
    protected _iterations: number = 0;
    protected _sleepTimeout: number;
    protected _suspended: boolean = false;
    protected _paused: boolean = false;

    /**
     * @constructor
     * @param {zThreadProps}
     * @param {zThreadProps.completeFn=} optional callback to execute once
     *        this thread has finished running its actions
     * @param {zThreadProps.executionFn=} optional function to execute upon
     *        each iteration of the thread execution, can also be undefined
     *        in case your prefer creating custom zThread class extensions
     *        and override the protected _executeInternal method.
     *        This method should return boolean true when ready, false when
     *        execution needs to continue over another iteration
     */
    constructor( props?: zThreadProps )
    {
        if ( typeof props?.executionFn === "function" ) {
            this._executeInternal = props.executionFn;
        }
        if ( typeof props?.completeFn === "function" ) {
            this._callback = props.completeFn;
        }
        this._iterations = 0;
        this._suspended  = false;
        this._paused     = false;
    }

    /* public methods */

    /**
     * starts running this thread
     */
    run(): void {
        if ( zThreader.add( this )) {
            this._iterations = 0;
        }
    }

    /**
     * halts thread execution and removes thread from zThreader
     */
    stop(): void {
        zThreader.remove( this );
    }

    /**
     * pauses thread execution, this will postpone thread
     * execution (and leave more CPU resources to other threads)
     * until unpause has been invoked
     */
    pause(): void {
        this._paused = true;
    }

    /**
     * unpauses previously halted thread execution
     */
    unpause(): void {
        this._paused = false;
    }

    /**
     * invoked by the ZThreader when this thread hits its
     * allocated time slot
     *
     * @param {number} allocatedTime amount of CPU time allocated to this thread
     * @return {boolean} whether this thread has completed its actions and can be
     *                   removed from the ZThreader. if the thread is to continue
     *                   running (either indefinitely or onto a next iteration)
     *                   value false should be returned
     */
    execute( allocatedTime: number ): boolean {
        const startTime = Date.now();

        while (( Date.now() - startTime ) < allocatedTime )
        {
            if ( this._executeInternal() ) {
                // completed execution ? invoke complete handler (invokes
                // registered callback and removes this thread from the ZThreader)
                this.handleComplete();
                return true;
            }
        }
        return false;
    }

    /**
     * suspend thread execution for a given duration
     *
     * @public
     * @param {number} duration in milliseconds
     */
    sleep( duration: number ): void {
        window.clearTimeout( this._sleepTimeout );
        this._suspended = true;

        this._sleepTimeout = window.setTimeout( () => {
            this._suspended = false;
        }, duration );
    }

    /**
     * query whether this thread can be executed
     */
    isExecutable(): boolean {
        return !this._suspended && !this._paused;
    }

    /* protected methods */

    /**
     * The method that performs the threads operations upon each iteration.
     * This value can either be passed in the constructor or by overriding
     * in your extending class.
     *
     * @return {boolean} whether this thread has completed its actions and can be
      *                  removed from the ZThreader
     */
    protected _executeInternal(): boolean {
        // override in subclass to track progress and return
        // state update as desired
        return false;
    };

    /**
     * invoke when this thread has finished its actions
     */
    protected handleComplete() {
        // remove this thread from zThreader
        this.stop();

        // execute callback if one was registered
        if ( typeof this._callback === "function" ) {
            this._callback();
        }
    };
};
