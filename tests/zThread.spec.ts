/**
 * @jest-environment jsdom
 */
import zThreader from "../src/zThreader";
import zThread from "../src/zThread";

describe( "zThread", () => {
    const TIME_PER_ITERATION = 1; // amount of ms execution time we allow while testing thread runs

    beforeEach(() => {
        jest.useFakeTimers();
        zThreader.init( 0.4, 60 );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it( "should be able to automatically add itself to the zThreader queue when run() is invoked for the first time", () => {
        jest.spyOn( zThreader, "add" );
        const thread = new zThread();

        expect( zThreader.add ).not.toHaveBeenCalled();

        thread.run();
        expect( zThreader.add ).toHaveBeenCalledWith( thread );
    });

    it( "should be able to automatically remove itself from the zThreader queue when stop() is invoked", () => {
        jest.spyOn( zThreader, "remove" );

        const thread = new zThread();
        thread.run();

        expect( zThreader.remove ).not.toHaveBeenCalled();

        thread.stop();
        expect( zThreader.remove ).toHaveBeenCalledWith( thread );
    });

    it( "should be able to pause execution", () => {
        const thread = new zThread();
        expect( thread.isExecutable() ).toBe( true );

        thread.pause();
        expect( thread.isExecutable() ).toBe( false );

        thread.unpause();
        expect( thread.isExecutable() ).toBe( true );
    });

    it( "should be able to suspend execution for a given timeout", () => {
        const thread = new zThread();
        expect( thread.isExecutable() ).toBe( true );

        thread.sleep( 1000 );
        expect( thread.isExecutable() ).toBe( false );

        jest.advanceTimersByTime( 500 );
        expect( thread.isExecutable() ).toBe( false );

        jest.advanceTimersByTime( 500 );
        expect( thread.isExecutable() ).toBe( true );
    });

    it( "should call the configured execution function in iterations when running", () => {
        // create mock execution function that completes after three executions
        let executions = 0;
        const executionFn = jest.fn(() => {
            jest.advanceTimersByTime( TIME_PER_ITERATION );
            if ( ++executions === 3 ) {
                return true;
            }
            return false;
        });
        const thread = new zThread({ executionFn });

        let completed = thread.execute( TIME_PER_ITERATION );
        expect( completed ).toBe( false );
        expect( executions ).toEqual( 1 );

        completed = thread.execute( TIME_PER_ITERATION );
        expect( completed ).toBe( false );
        expect( executions ).toEqual( 2 );

        completed = thread.execute( TIME_PER_ITERATION );
        expect( completed ).toBe( true );
        expect( executions ).toEqual( 3 );
    });

    it( "should call the optional complete handler on completion", () => {
        // create mock execution function that completes after two executions
        const completeFn = jest.fn();
        let executions = 0;
        const executionFn = jest.fn(() => {
            jest.advanceTimersByTime( TIME_PER_ITERATION );
            if ( ++executions === 2 ) {
                return true;
            }
            return false;
        });
        const thread = new zThread({ completeFn, executionFn });

        let completed = thread.execute( TIME_PER_ITERATION );

        expect( completed ).toBe( false );
        expect( completeFn ).not.toHaveBeenCalled();

        completed = thread.execute( TIME_PER_ITERATION );

        expect( completed ).toBe( true );
        expect( completeFn ).toHaveBeenCalled();
    });

    it( "should call stop() to remove itself from the zThreader queue on completion", () => {
        const executionFn = jest.fn(() => true );
        const thread = new zThread({ executionFn });
        jest.spyOn( thread, "stop" );

        thread.execute( Date.now() + 1 );
        expect( thread.stop ).toHaveBeenCalled();
    });
});
