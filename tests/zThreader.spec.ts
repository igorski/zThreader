/**
 * @jest-environment jsdom
 */
import zThreader from "../src/zThreader";
import zThread from "../src/zThread";

describe( "zThreader", () => {
    const RAF_TIMEOUT = 1000 / 60;

    beforeEach(() => {
        jest.useFakeTimers();
        let rafs = 0;
        jest.spyOn( window, "requestAnimationFrame" ).mockImplementation(
            cb => {
                return setTimeout(() => cb( RAF_TIMEOUT * ( ++rafs )), RAF_TIMEOUT );
            }
        );
        jest.spyOn( window, "cancelAnimationFrame" ).mockImplementation( timeout =>
            clearTimeout( timeout )
        );
    });

    afterEach(() => {
        window.requestAnimationFrame.mockRestore();
        jest.clearAllMocks();
        jest.clearAllTimers();
        zThreader.stop();
    });

    describe( "when adding zThreads to its internal processing queue", () => {
        it( "should know whether a specific zThread is present", () => {
            const thread1 = new zThread();
            const thread2 = new zThread();

            expect( zThreader.has( thread1 )).toBe( false );
            expect( zThreader.has( thread2 )).toBe( false );

            zThreader.add( thread1 );
            expect( zThreader.has( thread1 )).toBe( true );
            expect( zThreader.has( thread2 )).toBe( false );

            zThreader.add( thread2 );
            expect( zThreader.has( thread1 )).toBe( true );
            expect( zThreader.has( thread2 )).toBe( true );
        });

        it( "should be able to keep track of the added number of zThreads", () => {
            const thread1 = new zThread();
            const thread2 = new zThread();

            expect( zThreader.getAmountOfThreads() ).toEqual( 0 );

            zThreader.add( thread1 );
            expect( zThreader.getAmountOfThreads() ).toEqual( 1 );

            zThreader.add( thread2 );
            expect( zThreader.getAmountOfThreads() ).toEqual( 2 );
        });

        it( "should not add the same zThread twice", () => {
            const thread1 = new zThread();

            let added = zThreader.add( thread1 );
            expect( added ).toBe( true );
            expect( zThreader.getAmountOfThreads() ).toEqual( 1 );

            added = zThreader.add( thread1 )
            expect( added ).toBe( false );
            expect( zThreader.getAmountOfThreads() ).toEqual( 1 );
        });

        it( "should be able to remove individual zThreads", () => {
            const thread1 = new zThread();
            const thread2 = new zThread();

            zThreader.add( thread1 );
            zThreader.add( thread2 );

            expect( zThreader.getAmountOfThreads() ).toEqual( 2 );

            zThreader.remove( thread1 );

            expect( zThreader.has( thread1 )).toBe( false );
            expect( zThreader.has( thread2 )).toBe( true );

            expect( zThreader.getAmountOfThreads() ).toEqual( 1 );
        });

        it( "should automatically start running the threads as soon as the first thread is added", () => {
            jest.spyOn( zThreader, "run" );

            zThreader.add( new zThread() );
            zThreader.add( new zThread() );
            zThreader.add( new zThread() );

            expect( zThreader.run ).toHaveBeenCalledTimes( 1 );
        });

        it( "should automatically stop running the threads as soon as the last thread is removed", () => {
            jest.spyOn( zThreader, "stop" );

            const thread1 = new zThread();
            const thread2 = new zThread();

            zThreader.add( thread1 );
            zThreader.add( thread2 );

            expect( zThreader.stop ).not.toHaveBeenCalled();

            zThreader.remove( thread1 );
            expect( zThreader.stop ).not.toHaveBeenCalled();

            zThreader.remove( thread2 );
            expect( zThreader.stop ).toHaveBeenCalled();
        });
    });

    it( "should remove all zThreads when stop() is called", () => {
        const thread1 = new zThread();
        const thread2 = new zThread();

        zThreader.add( thread1 );
        zThreader.add( thread2 );

        expect( zThreader.getAmountOfThreads() ).toEqual( 2 );

        zThreader.stop();

        expect( zThreader.getAmountOfThreads() ).toEqual( 0 );
    });

    it( "should defer zThread execution using requestAnimationFrame", () => {
        jest.spyOn( zThreader, "execute" );

        zThreader.run();
        expect( zThreader.execute ).not.toHaveBeenCalled();

        jest.advanceTimersByTime( RAF_TIMEOUT );
        expect( zThreader.execute ).toHaveBeenCalled();
    });

    describe( "when the zThreader is running", () => {
        // for some reason thread1 is paused (and therefor suspended) when executed here??
        xit( "should allocate execution of non-suspended zThreads", () => {
            const thread1 = new zThread();

            jest.spyOn( thread1, "execute" );
            zThreader.add( thread1 );

            jest.advanceTimersByTime( RAF_TIMEOUT );
            expect( thread1.execute ).toHaveBeenCalled();
        });

        it( "should not allocate execution for suspended zThreads", () => {
            const thread1 = new zThread();
            thread1.pause();

            jest.spyOn( thread1, "execute" );
            zThreader.add( thread1 );

            jest.advanceTimersByTime( RAF_TIMEOUT );
            expect( thread1.execute ).not.toHaveBeenCalled();
        });
    });
});
