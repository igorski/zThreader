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
import type zThread from "./zThread";

/**
 * zThreader functions as a static class, managing individual
 * zThreads and delegating their execution in separate iterations.
 */
export default class zThreader
{
    private static _threads: zThread[] = [];

    /**
     * the desired "framerate" we'd like to
     * run the application at (i.e. we use this to
     * calculate the iterations for each thread)
     */
    private static _fps: number = 60;

    private static _executeInterval: number = ( 1000 / 60 );

    /**
     * timestamp of the last execution cycle
     */
    private static _lastExecution: number = 0;

    /**
     * the percentage (range 0-1) of CPU cycles
     * we will allocate to executing the threaded methods
     */
    private static _priority: number = 0.4;

    private static _requestId: number = -1;

    /**
     * prepares the ZThreader for use
     *
     * @param {number} priority the percentage (0-1 range) of priority we
     *        give the threader upon each cycle, the higher the percentage
     *        the less CPU resources will be left to the UI
     * @param {number=} desiredFrameRate desired framerate we'd like
     *        to run the application in (basically we allow the ZThreader
     *        only as much CPU cycles to ensure the rendering of the application
     *        can run smoothly at the specified framerate) this defaults to 60 fps
     */
    static init( priority: number, desiredFrameRate: number ): void {
        this.setPriority( priority );
        this._fps = desiredFrameRate || 60;
        this._executeInterval = 1000 / this._fps;
    }

    /**
     * register a new zThread for running
     *
     * @param {zThread} thread
     * @return {boolean} whether thread has been added
     */
    static add( thread: zThread ): boolean {
        if ( !this.has( thread )) {
            this._threads.push( thread );

            // start running if this is the first thread in the ZThreader
            // (meaning the ZThreader was previously idle)

            if ( this._threads.length === 1 ) {
                this.run();
            }
            return true;
        }
        return false;
    }

    /**
     * remove a registered ZThread
     *
     * @param {zThread} thread
     * @return {boolean} whether thread has been found and removed
     */
    static remove( thread: zThread ): boolean
    {
        const threads = this._threads;
        let i = threads.length;
        let spliced = false;

        while ( i-- )
        {
            if ( threads[ i ] === thread ) {
                threads.splice( i, 1 );
                spliced = true;
                break;
            }
        }

        // if no threads remain, stop running

        if ( spliced && threads.length === 0 ) {
            this.stop();
        }
        return false;
    }

    /**
     * query whether a specific ZThread has been
     * registered for threading (and thus: is running)
     *
     * @param {zThread} thread
     * @return {boolean} whether thread has been found
     */
    static has( thread: zThread ): boolean {
        return this._threads.indexOf( thread ) > -1;
    }

    /**
     * removes all running threads
     * and removes timer
     */
    static stop(): void {
        this._threads.length = 0;
        cancelAnimationFrame( this._requestId );
    }

    /**
     * retrieve the number of active threads
     */
    static getAmountOfThreads(): number {
        return this._threads.length;
    }

    /**
     * @param {number} percentage in 0-1 range
     */
    static setPriority( percentage: number ): void {
        this._priority = percentage;
    }

    /* private methods */

    /**
     * adds the timer and starts processing
     * all threads
     *
     * NOTE : if application is supposed to run in older
     * browsers that don't support RequestAnimationFrame
     * you can easily use a polyfill/shim that uses a
     * setTimeout/setInterval-fallback
     */
    private static run(): void {
        this._requestId = requestAnimationFrame( this.execute.bind( this ));
    }

    /**
     * called by the timing function, this is what
     * actually runs all the threads, and shouldn't be
     * invoked manually (use "run" instead)
     */
    private static execute(): void
    {
        const now   = Date.now();
        const delta = now - this._lastExecution;

        // only execute thread processes at the allotted time slot...
        if ( delta > this._executeInterval )
        {
            this._lastExecution = now - ( delta % this._executeInterval );

            const threadAmount = this._threads.length;

            let timeAllocation = this._priority < 1 ? ( 1000 / this._executeInterval ) * this._priority + 1 : this._fps - this._priority;
            timeAllocation = Math.max( timeAllocation, threadAmount );

            let processAllocation = timeAllocation / threadAmount;
            let i = threadAmount, suspended = 0;

            while ( i-- )
            {
                const thread = this._threads[ i ];
                if ( thread.isExecutable() )
                {
                    if ( thread.execute( processAllocation ))
                    {
                        // if thread completed its lifecycle, distribute more time
                        // among the remaining processes
                        const remainingThreads = this._threads.length;

                        if ( remainingThreads > suspended ) {
                            processAllocation = timeAllocation / ( remainingThreads - suspended );
                        }
                    }
                }
                else
                {
                    // thread is suspended, allow more allocated time for next processes
                    ++suspended;

                    if ( this._threads.length > 1 ) {
                        processAllocation = timeAllocation / ( this._threads.length - suspended );
                    }
                }
            }
            // calculate the total execution time
            const elapsed = Date.now() - now;
        }
        // queue next cycle (run-method basically functions as a
        // "step"-function once it has commenced running
        if ( this._threads.length > 0 ) {
            this.run();
        }
    }
};
